output "repository_name" {
  description = "Name of the ECR repository"
  value       = aws_ecr_repository.ecr.name
}

output "repository_url" {
  description = "URL of the ECR repository, used for docker tag / docker push"
  value       = aws_ecr_repository.ecr.repository_url
}

output "repository_arn" {
  description = "ARN of the ECR repository, useful for IAM permissions"
  value       = aws_ecr_repository.ecr.arn
}