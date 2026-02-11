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