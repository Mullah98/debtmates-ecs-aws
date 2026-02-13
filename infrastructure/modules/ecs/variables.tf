variable "cluster_name" {
  description = "Name of the ECS cluster"
  type = string
}

variable "service_name" {
  description = "Name of the ECS service"
  type = string
}

variable "alb_security_group_id" {
  description = "ID of the ALB Security Group"
  type = string
}

variable "vpc_id" {
  description = "ID of the main VPC"
  type = string
}

variable "task_definition_name" {
  description = "Name of the ECS task definition"
  type = string
}

variable "ecr_image_uri" {
  description = "Image URI from the ECR"
  type = string
}

variable "aws_region" {
  description = "AWS Region"
  type = string
}

variable "private_subnet_ids" {
  description = "ID(s) of the private subnets"
  type = list(string)
}

variable "alb_target_group_arn" {
  description = "ARN of the ALB target group"
  type = string
}

variable "container_name" {
  description = "Name of the container defined in the ECS task definition"
  type = string
}