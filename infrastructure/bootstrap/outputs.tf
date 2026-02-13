output "s3_bucket_name" {
  description = "Name of the S3 bucket for Terraform state"
  value = aws_s3_bucket.tf_state.id
}

output "s3_bucket_arn" {
  description = "ARN of the S3 bucket"
  value = aws_s3_bucket.tf_state.arn
}

output "dynamodb_table_name" {
  description = "Name of the DynamoDB table for state locking"
  value = aws_dynamodb_table.tf_locks.id
}

output "backend_config" {
  description = "Backend configuration to use in main Terraform code"
  value = <<-EOT
      backend "s3" {
      bucket = "${aws_s3_bucket.tf_state.id}"
      key = "terraform.tfstate"
      region = "${var.aws_region}"
      dynamodb_table = "${aws_dynamodb_table.tf_locks.id}"
      encrypt = true
    }
   EOT 
}