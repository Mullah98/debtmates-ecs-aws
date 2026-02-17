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