output "alb_security_group_id" {
  description = "ID of the ALB security group"
  value = aws_security_group.alb_sg.id
}

output "target_group_arn" {
  description = "ARN for the ALB target group"
  value = aws_lb_target_group.alb_tg.arn
}

output "alb_dns_name" {
  description = "ALB DNS name for Cloudflare CNAME records"
  value = aws_lb.alb.dns_name
}

output "alb_arn" {
  description = "ARN for ALB"
  value = aws_lb.alb.arn
}