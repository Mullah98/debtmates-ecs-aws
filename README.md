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
- mentioon 1 total nat rather than per AZ. (lower cost, single AZ failure risk)










---


