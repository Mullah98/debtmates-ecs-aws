output "vpc_id" {
  description = "ID of the main VPC"
  value = aws_vpc.main.id
}

output "public_subnet_ids" {
  value = [
    aws_subnet.public_subnet_2a.id,
    aws_subnet.public_subnet_2b.id
  ]
}

output "private_subnet_ids" {
  value = [
    aws_subnet.private_subnet_2a.id,
    aws_subnet.private_subnet_2b.id
  ]
}