module "vpc" {
  source = "./modules/vpc"

  availability_zone = var.availability_zone
  vpc_cidr = var.vpc_cidr
  public_subnet_cidr = var.public_subnet_cidr
  private_subnet_cidr = var.private_subnet_cidr
}

module "ecr" {
  source = "./modules/ecr"

  ecr_name = var.ecr_name
}

module "acm" {
  source = "./modules/acm"

  cloudflare_zone_id = var.cloudflare_zone_id
  domain_name = var.domain_name
  subject_alternative_names = var.subject_alternative_names
  dns_record_name = var.dns_record_name
  alb_dns_name = module.alb.alb_dns_name
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
  ecr_image_uri = "${module.ecr.repository_url}:${var.image_tag}"
  vpc_id = module.vpc.vpc_id
  aws_region = var.aws_region
  cluster_name = var.app_name
  alb_target_group_arn = module.alb.target_group_arn
  ecs_service_name = var.app_name
  private_subnet_ids = module.vpc.private_subnet_ids
}

module "iam" {
  source = "./modules/iam"

  ecr_repository_arn = module.ecr.repository_arn
  github_org = var.github_org
  github_repo = var.github_repo
  s3_bucket_arn = var.s3_bucket_arn
  dynamodb_table_arn = var.dynamodb_table_arn
}