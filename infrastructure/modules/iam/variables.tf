variable "github_org" {
  description = "Name of the GitHub Org"
  type = string
}

variable "github_repo" {
  description = "Name of the GitHub repository" 
  type = string
}

variable "ecr_repository_arn" {
  description = "ARN of the ECR repository"  
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