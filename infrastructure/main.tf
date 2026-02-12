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

module "alb" {
  source = "./modules/alb"

  certificate_arn = module.acm.arn
  vpc_id = module.vpc.vpc_id
  public_subnet_ids = module.vpc.public_subnet_ids
}