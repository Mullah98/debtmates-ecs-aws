## S3 bucket for terraform state

resource "aws_s3_bucket" "tf_state" {
  bucket = "${var.project_name}-${var.environment}-tf-state"

  tags = {
    Name = "Terraform State Bucket"
    Environment = var.environment
    Project = var.project_name
  }
}

## Enable versioning to keep state file history

resource "aws_s3_bucket_versioning" "tf_state" {
  bucket = aws_s3_bucket.tf_state.id

  versioning_configuration {
    status = "Enabled"
  }
}

## Enable encryption at rest

resource "aws_s3_bucket_server_side_encryption_configuration" "tf_state" {
  bucket = aws_s3_bucket.tf_state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

## Block public access

resource "aws_s3_bucket_public_access_block" "tf_state" {
  bucket = aws_s3_bucket.tf_state.id

  block_public_acls = true
  block_public_policy = true
  ignore_public_acls = true
  restrict_public_buckets = true
}

## DynamoDB table for state locking

resource "aws_dynamodb_table" "tf_locks" {
  name = "${var.project_name}-${var.environment}-tf-locks"
  billing_mode = "PAY_PER_REQUEST"
  hash_key = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }

  tags = {
    Name = "Terraform Lock Table"
    Environment = var.environment
    Project = var.project_name
  }
}