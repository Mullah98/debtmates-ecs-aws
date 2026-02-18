output "cluster_id" {
  description = "ID of the ECS cluster"
  value       = aws_ecs_cluster.debtmates_cluster.id
}

output "cluster_name" {
  description = "Name of the ECS cluster"
  value       = aws_ecs_cluster.debtmates_cluster.name
}

output "service_name" {
  description = "Name of the ECS service"
  value       = aws_ecs_service.debtmates_service.name
}

output "task_definition_arn" {
  description = "ARN of the ECS task definition"
  value       = aws_ecs_task_definition.debtmates_task_definition.arn
}

output "security_group_id" {
  description = "ID of the ECS tasks security group"
  value       = aws_security_group.ecs_task_sg.id
}

output "log_group_name" {
  description = "Name of the Cloudwatch log group"
  value       = aws_cloudwatch_log_group.cloudwatch_group.name
}

