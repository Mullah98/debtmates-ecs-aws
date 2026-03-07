output "vpc_id" {
  description = "ID of the main VPC"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "List of public subnet ids"
  value       = values(aws_subnet.public_subnets)[*].id
}

output "private_subnet_ids" {
  description = "List of private subnet ids"
  value       = values(aws_subnet.private_subnets)[*].id
}