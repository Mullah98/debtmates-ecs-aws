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

module "ecs" {
  source = "./modules/ecs"

  alb_security_group_id = module.alb.alb_security_group_id
  task_definition_name = var.app_name
  container_name = var.app_name
  ecr_image_uri = module.ecr.repository_url
  vpc_id = module.vpc.vpc_id
  aws_region = var.aws_region
  cluster_name = var.app_name
  alb_target_group_arn = module.alb.target_group_arn
  ecs_service_name = var.app_name
  private_subnet_ids = module.vpc.public_subnet_ids
}