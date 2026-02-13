## VPC Module variables

variable "availability_zone" {
  type = list(string)
  default = [ "eu-west-2a", "eu-west-2b" ]
}

variable "vpc_cidr" {
  type = string
  default = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  type = list(string)
  description = "CIDR blocks for public subnets"
  default = [ "10.0.0.0/24", "10.0.2.0/24" ]
}

variable "private_subnet_cidr" {
  type = list(string)
  description = "CIDR blocks for private subnets"
  default = [ "10.0.1.0/24", "10.0.3.0/24" ]
}

## ECR Module variables

variable "ecr_name" {
  type = string
  description = "ECR Repository name"
  default = "debtmates"
}

## ACM Module variables

variable "cloudflare_api_token" {
  type = string
  sensitive = true
}

variable "cloudflare_zone_id" {
  type = string
}

variable "domain_name" {
  type = string
  default = "ibrahimdevops.co.uk"
}

variable "subject_alternative_names" {
  type = list(string)
  default = ["*.ibrahimdevops.co.uk"]
}

## ECS Module variables

variable "app_name" {
  type = string
  default = "debtmates"
}

variable "aws_region" {
  type = string
  default = "eu-west-2"
}
