# debtmates-ecs-aws


1. Dockerise app
- had issues with npm install stage. Fixed by removing important files from dockerignore

- issue with env variables. Created docker compose and put in values
- same issue, instead of passing the vars during runetime, it needs them at build time. 

screenshots:
    - shows dockerfile
    - shows healthroute status ok
    - 

2. Clickops
- issue when running a new task. Added variables to secret manager and policy to IAM user to be able to read variables but still not working. Realised I ran docker build instead of docker compose when pushing it to ECR

- The ECS task was registered to the target group but remained **unhealthy (“request timed out”)**.

### **Root causes**

There were two issues:

1. **Wrong security group rule on the ECS tasks**

* Initially, the task security group only allowed **TCP 80**, but your app actually runs on **port 3000**.
* Because of this, the ALB could not reach the container → health checks timed out.

2. **Port mismatch in thinking**

* You were opening **80 on the task**, but the ALB talks to the container on **3000**, not 80.

---

# ✅ How You Solved It

You fixed it by:

1. Creating a **separate ECS Task Security Group** and adding:

   * **Inbound: TCP 3000 from the ALB security group only**

2. Keeping the ALB security group public with:

   * TCP 80 and 443 from `0.0.0.0/0`

3. Ensuring your app listens on:

```
0.0.0.0:3000
```

(not localhost)

Once that was done:

* The target in the target group turned **Healthy**
* The ALB could successfully route traffic to ECS.


You then:

* Used an existing **ACM certificate** that included:

```
*.ibrahimdevops.co.uk
```

* Added an **HTTPS:443 listener** on the ALB forwarding to `debtmates-tg`
* Changed **HTTP:80** to **redirect to HTTPS 443**

Result:

* HTTPS works
* HTTP automatically redirects to HTTPS.


---
## Terraform

1) Region + naming
AWS region: eu-west-2
Names you want to reuse:
Cluster: <name>
Service: <name>
ALB: debtmates-alb
Target group: debtmates-tg

2) Networking
VPC ID (default VPC) and subnet IDs used by:
ALB subnets (public; you used 2a/2b/2c)
ECS task subnets (which ones you selected)
Whether tasks have public IP enabled or not

3) Ports and health checks
Container port: 3000
Target group:
Target type: ip
Protocol: HTTP
Port: 3000
Health check path: /health

4) Security groups (critical)
Write down the exact rules:
ALB SG inbound: 80/443 from 0.0.0.0/0
Task SG inbound: 3000 from ALB SG
(These become aws_security_group_rule blocks.)

5) ECS task definition settings
CPU / Memory values used
Image URI (ECR repo + tag)
Environment variables (if any)
CloudWatch log group name (if created)

6) ALB listeners
Listener 80: redirect → HTTPS 443 (301)
Listener 443: forward to target group + ACM cert ARN

7) ACM certificate
The certificate ARN you attached (for *.ibrahimdevops.co.uk)
In Terraform you’ll likely reference it via a data "aws_acm_certificate" lookup or hardcode ARN.

8) DNS
Decide what Terraform will manage:
Route 53 record you created: debtmates.ibrahimdevops.co.uk A Alias → ALB
Hosted zone ID in Route 53 (if you plan to manage it)

---

VPC - cidr block 10.0.0.0/16
public sub - cidr block 10.0.0.0/24 - eu-west-2a
public sub 2 - cidr block 10.0.3.0/24 - eu-west-2b
private sub - cidr block 10.0.1.0/24 - eu-west-2a
private sub 2 - cidr block 10.0.2.0/24 - eu-west-2b
Route table 1 - 10.0.0.0/16 local - 0.0.0.0/0 igw
Route table 2 - 10.0.0.0/16 local - 0.0.0.0/0 nat


# vpc
- chose 2 nats instead of 1 for lower chance of risk failures

# ecr
- include image scanning on push, make tags MUTABLE (push a new image to same tag)

# acm
- need to add cloudflare provider to use cloudflare resources. otherwise will have to use terraform apply to get the certificate arn.
- with cloudlfare, use zone-scoped api key instead of global. much safer.
- created a terraform.tfvars for the api token, in provider, referneced the token. Confirmed with terraform console, var.token, responded with (sensitive value).
- issue with cloudflare resource names. Had to add versions.tf to acm/, rename resource name and attribute
- fqdns -> passed in r.name which only gives the subdomain. using hostname instead will give full FQDN (fully qualified dns name)

# alb
Create resources in order security group -> target group -> load balancer -> listener

# ecs
- had to crete an iam role for the ecs tasks
- for task definition, might need task_role_arn for s3 access

---
## terraform apply problems
- Old cname records existed. duplicate cname record names because of dvo.domain_name instead of dvo.resource_record_name

- ECR repository exists. Need to delete before creating a new one

Issue 4: Duplicate ACM Validation Records (First Attempt)
Error: failed to make http req - "Identical record already exists" (after cleaning up old records)
Cause: ACM validation for_each loop was keyed by dvo.domain_name, causing duplicate DNS records when both ibrahimdevops.co.uk and *.ibrahimdevops.co.uk used the same validation record name
Original code:
terraformfor_each = {
  for dvo in aws_acm_certificate.cert.domain_validation_options :
  dvo.domain_name => {  # ❌ Creates duplicates
    name = dvo.resource_record_name
    ...
  }
}
First fix attempt: Changed key to dvo.resource_record_name
terraformfor_each = {
  for dvo in aws_acm_certificate.cert.domain_validation_options :
  dvo.resource_record_name => {  # Better, but...
    name = dvo.resource_record_name
    ...
  }
}

Issue 5: Duplicate Object Key Error
Error: Duplicate object key - "Two different items produced the key '_f55cc09be39a79b1fdddaebfd88d132f.ibrahimdevops.co.uk.'"
Cause: Both domains (ibrahimdevops.co.uk and *.ibrahimdevops.co.uk) generated the exact same validation record, causing a duplicate key in the for_each map
Fix: Added ellipsis (...) to group duplicates:
terraformfor_each = {
  for dvo in aws_acm_certificate.cert.domain_validation_options :
  dvo.resource_record_name => {
    name = dvo.resource_record_name
    type = dvo.resource_record_type
    value = dvo.resource_record_value
  }...  # ✅ Groups duplicates into array
}

Issue 6: Unsupported Attribute - Tuple Access
Error: Unsupported attribute - "each.value is tuple with 2 elements"
Cause: The ... ellipsis created an array/tuple of values, so each.value.name no longer worked
Fix: Accessed the first element of the array:
terraformname    = each.value[0].name     # ✅ Access first element
content = each.value[0].value    
type    = each.value[0].type
Final working code:
terraformresource "cloudflare_dns_record" "acm_validation" {
  for_each = {
    for dvo in aws_acm_certificate.cert.domain_validation_options :
    dvo.resource_record_name => {
      name  = dvo.resource_record_name
      type  = dvo.resource_record_type
      value = dvo.resource_record_value
    }...  # Handle duplicates
  }

  zone_id = var.cloudflare_zone_id
  name    = each.value[0].name      # Access first element
  content = each.value[0].value
  type    = each.value[0].type
  ttl     = 60
  proxied = false
}

---

## CICD

1. First pipeline. Had to set up OIDC and create IAm module to create least privelge policies.
extras: Include messages if login failures or images not pushed to ecr

