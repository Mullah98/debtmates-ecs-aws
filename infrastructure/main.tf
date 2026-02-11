module "vpc" {
  source = "./modules/vpc"
}

module "ecr" {
  source = "./modules/ecr"
}

module "acm" {
  source = "./modules/acm"

  cloudflare_zone_id = var.cloudflare_zone_id
  domain_name = var.domain_name
  subject_alternative_names = var.subject_alternative_names
}