terraform {
  backend "s3" {
    bucket = "debtmates-dev-tf-state"
    key = "terraform.tfstate"
    region = "eu-west-2"
    dynamodb_table = "debtmates-dev-tf-locks"
    encrypt = true
  }
}


