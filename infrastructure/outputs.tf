## VPC Outputs

output "vpc_id" {
  description = "ID of the VPC"
  value       = module.vpc.vpc_id
}

output "public_subnet_ids" {
  description = "IDs of the public subnet"
  value       = module.vpc.public_subnet_ids
}

output "private_subnet_ids_subnet_ids" {
  description = "IDs of the public subnet"
  value       = module.vpc.private_subnet_ids
}

## ECR Outputs

output "ecr_repository_url" {
  description = "URL of the ECR repository to push images"
  value       = module.ecr.repository_url
}

output "ecr_repository_name" {
  description = "Name of ECR repository"
  value       = module.ecr.repository_name
}

## ALB Outputs

output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = module.alb.alb_dns_name
}

output "alb_arn" {
  description = "ARN of the Application Load Balancer"
  value       = module.alb.alb_arn
}

## ACM Outputs

output "certificate_arn" {
  description = "ARN of the ACM certificate"
  value       = module.acm.arn
}


## ECS Outputs

output "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  value       = module.ecs.cluster_name
}

output "ecs_service_name" {
  description = "Name of the ECS Service"
  value       = module.ecs.service_name
}

## Application URL
output "application_url" {
  description = "URL to access the application"
  value       = "https://${var.dns_record_name}.${var.domain_name}"
}

## Health check endpoint
output "health_check_url" {
  description = "Health check endpoint for the application"
  value       = "https://${var.dns_record_name}.${var.domain_name}/health"
}

## IAM Outputs

output "iam_role_arn" {
  description = "ARN of the GitHub Actions IAM role"
  value       = module.iam.iam_role_arn
}