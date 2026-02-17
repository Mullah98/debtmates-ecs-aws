## VPC Module variables

variable "availability_zone" {
  description = "List of AZs"
  type = list(string)
  default = [ "eu-west-2a", "eu-west-2b" ]
}

variable "vpc_cidr" {
  description = "Main VPC cidr block"
  type = string
  default = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  description = "CIDR blocks for public subnets"
  type = list(string)
  default = [ "10.0.0.0/24", "10.0.2.0/24" ]
}

variable "private_subnet_cidr" {
  description = "CIDR blocks for private subnets"
  type = list(string)
  default = [ "10.0.1.0/24", "10.0.3.0/24" ]
}

## ECR Module variables

variable "ecr_name" {
  description = "ECR Repository name"
  type = string
  default = "debtmates"
}

## ACM Module variables

variable "cloudflare_api_token" {
  description = "API token for Cloudflare provider"
  type = string
  sensitive = true
}

variable "cloudflare_zone_id" {
  description = "Zone ID for the Cloudflare resources"
  type = string
}

variable "domain_name" {
  description = "Personal domain name from Cloudflare"
  type = string
  default = "ibrahimdevops.co.uk"
}

variable "subject_alternative_names" {
  description = "Wildcard domain name for subdomains"
  type = list(string)
  default = ["*.ibrahimdevops.co.uk"]
}

variable "dns_record_name" {
  description = "Subdomain name for the DNS record"
  type = string
  default = "debtmates"
}

## ECS Module variables

variable "app_name" {
  description = "Name of my app"
  type = string
  default = "debtmates"
}

variable "aws_region" {
  description = "AWS region"
  type = string
  default = "eu-west-2"
}

variable "image_tag" {
  description = "Docker image tag to deploy"
  type = string
  default = "latest"
}

## IAM Module variables

variable "github_org" {
  description = "Name of GitHub Org"
  type = string
}

variable "github_repo" {
  description = "Name of GitHub Repository"
  type = string
}

variable "s3_bucket_arn" {
  description = "ARN of the S3 Bucket"
  type = string
}

variable "dynamodb_table_arn" {
  description = "ARN of the DynamoDB table"
  type = string
}