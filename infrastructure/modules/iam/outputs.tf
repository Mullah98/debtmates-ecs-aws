output "iam_role_arn" {
  description = "ARN of the GitHub Actions IAM role"  
  value = aws_iam_role.github_actions_role.arn
}

output "iam_role_name" {
  description = "Name of the GitHub Actions IAM role"
  value = aws_iam_role.github_actions_role.name
}