output "iam_role_arn" {
  description = "ARN of the IAM role"
  value       = aws_iam_role.github_actions_terraform_role.arn
}

output "iam_role_name" {
  description = "Name of the IAM role"
  value       = aws_iam_role.github_actions_terraform_role.name
}