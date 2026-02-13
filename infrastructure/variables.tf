variable "cloudflare_api_token" {
  type = string
  sensitive = true
}

variable "domain_name" {
  type = string
  default = "ibrahimdevops.co.uk"
}

variable "subject_alternative_names" {
  type = list(string)
  default = ["*.ibrahimdevops.co.uk"]
}

variable "cloudflare_zone_id" {
  type = string
}

variable "app_name" {
  type = string
  default = "debtmates"
}

variable "aws_region" {
  type = string
  default = "eu-west-2"
}
