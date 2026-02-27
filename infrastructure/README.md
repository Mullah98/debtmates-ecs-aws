## Infrastructure as Code (Terraform)

### Infrastructure Layout

```text
infrastructure/
├── bootstrap/
├── modules/
│   ├── acm/
│   ├── alb/
│   ├── ecr/
│   ├── ecs/
│   ├── iam/
│   └── vpc/
├── backend.tf
├── main.tf
├── outputs.tf
├── variables.tf
└── tfvars.tf
└── .gitignore
```

---

## Folder Overview

| Path          | Purpose                                  | Notes                                                       |
| ------------- | ---------------------------------------- | ----------------------------------------------------------- |
| `bootstrap/`  | Creates Terraform remote state resources | Provisions S3 bucket and DynamoDB table for state + locking |
| `modules/`    | Reusable Terraform modules               | Each subfolder represents an AWS component                  |
| `modules/acm` | SSL certificate management               | Requests ACM cert and validates via Cloudflare DNS          |
| `modules/alb` | Load balancing                           | ALB, listeners, and target groups                           |
| `modules/ecr` | Container registry                       | ECR repositories                                            |
| `modules/ecs` | Compute services                         | ECS cluster, services, task definitions                     |
| `modules/iam` | IAM roles & policies                     | Permissions for services                                    |
| `modules/vpc` | Networking                               | VPC, subnets, routing, gateways                             |

---

## Root Terraform Files

| File                  | Purpose                                            |
| --------------------- | -------------------------------------------------- |
| `main.tf`             | Entry point that composes all modules              |
| `variables.tf`        | Global input variables                             |
| `outputs.tf`          | Exported outputs (e.g. ALB DNS, service endpoints) |
| `backend.tf`          | Remote state configuration (S3 + DynamoDB locking) |
| `tfvars.tf`           | Local environment values (ignored from Git)        |

---

## Module Structure

Each module follows a consistent layout:

| File           | Purpose                         |
| -------------- | ------------------------------- |
| `main.tf`      | Resource definitions            |
| `variables.tf` | Module inputs                   |
| `outputs.tf`   | Values exposed to other modules |

## Remote State

Terraform state is stored remotely using:

* **S3 bucket** → stores Terraform state file
* **DynamoDB table** → provides state locking to prevent concurrent changes

These resources are created once using the `bootstrap` configuration.

## Certificate & DNS Flow

The `acm` module handles HTTPS certificate provisioning:

1. Requests an ACM certificate
2. Generates DNS validation records
3. Creates corresponding Cloudflare DNS records
4. Waits for validation to complete

This allows the Application Load Balancer to serve secure HTTPS traffic.

## Screenshots


### Application Load Balancer Resource Map
![alb-resource-map](../assets/images/alb-map.png)

### ALB Target Groups
![healthy-tg](../assets/images/alb-tg.png)

### ECR Repository
![ecr-repo](../assets/images/ecr-repo.png)

### ECS Cluster
![ecs-cluster](../assets/images/ecs-cluster.png)

### ECS Tasks Running
![ecs-task](../assets/videos/ecs-tasks.gif)

### ECS Cloudwatch Logs
![cloudwatch-logs](../assets/images/cloudwatch-logs.png)