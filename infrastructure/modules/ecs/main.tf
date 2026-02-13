## Create ecs cluster

resource "aws_ecs_cluster" "debtmates_cluster" {
  name = var.cluster_name

  setting {
    name = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name = var.cluster_name
  }
}

resource "aws_cloudwatch_log_group" "cloudwatch_group" {
  name = "/ecs/${var.cluster_name}/${var.service_name}"

  retention_in_days = 7

  tags = {
    Name = "${var.cluster_name}-logs"
  }
}

## Create task security group

resource "aws_security_group" "ecs_task_sg" {
  name = "${var.cluster_name}-ecs-tasks-sg"
  description = "Security group for the ECS task definitions"
  vpc_id = var.vpc_id

  ingress {
    from_port = 3000
    to_port = 3000
    protocol = "tcp"
    security_groups = [var.alb_security_group_id]
  }

  egress {
    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.cluster_name}-ecs-tasks-sg"
  }
}

## Create IAM role for the ECSTaskExecutionRolePolicy

resource "aws_iam_role" "ecs_execution_role" {
  name = "${var.cluster_name}-ecs-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
            Service = "ecs-tasks.amazonaws.com"
        }
    }]
  })

  tags = {
    Name = "${var.cluster_name}-execution-role"
  }
}

resource "aws_iam_role_policy_attachment" "ecs_task_policy" {
  role = aws_iam_role.ecs_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

## Create task definitions

resource "aws_ecs_task_definition" "debtmates_task_definition" {
  family = "${var.task_definition_name}-task"
  requires_compatibilities = ["FARGATE"]
  network_mode = "awsvpc"
  execution_role_arn = aws_iam_role.ecs_execution_role.arn
  cpu = 256
  memory = 512
  container_definitions = jsonencode([{
    name = var.container_name
    image = var.ecr_image_uri
    essential = true

    portMappings = [
        {
            containerPort = 3000
            protocol = "tcp"
        }
    ]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group" = aws_cloudwatch_log_group.cloudwatch_group.name
        "awslogs-region" = var.aws_region
        "awslogs-stream-prefix" = "ecs"
      }
    }

    healthCheck = {
      command = ["CMD-SHELL", "curl -f http://localhost:3000/health || exit 1"]
      interval = 30
      timeout = 5
      retries = 3
      startPeriod = 60
    }

  }])
}

## Create the ECS 

resource "aws_ecs_service" "debtmates_service" {
  name = var.service_name
  cluster = aws_ecs_cluster.debtmates_cluster.id
  task_definition = aws_ecs_task_definition.debtmates_task_definition.arn
  desired_count = 2
  launch_type = "FARGATE"
  depends_on = [ aws_iam_role_policy_attachment.ecs_task_policy ]

  deployment_minimum_healthy_percent = 50
  deployment_maximum_percent = 200

  network_configuration {
    subnets = var.private_subnet_ids
    security_groups = [aws_security_group.ecs_task_sg.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = var.alb_target_group_arn
    container_name = var.container_name
    container_port = 3000
  }
}