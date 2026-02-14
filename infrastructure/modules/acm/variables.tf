variable "cloudflare_zone_id" {
  type = string
}

variable "domain_name" {
  type = string
}

variable "subject_alternative_names" {
  type = list(string)
}

variable "dns_record_name" {
  type = string
}

variable "alb_dns_name" {
  type = string
}
