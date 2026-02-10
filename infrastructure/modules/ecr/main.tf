resource "aws_ecr_repository" "ecr" {
  name = var.ecr_name
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "ecr-${var.ecr_name}"
  }
}