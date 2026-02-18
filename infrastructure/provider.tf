terraform {
    required_version = ">= 1.5.0"
    
  required_providers {
    cloudflare = {
      source = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
    aws = {
        source = "hashicorp/aws"
        version = "~> 6.0"
    }
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

provider "aws" {
  region = "eu-west-2"
}