## Req an acm certificate

resource "aws_acm_certificate" "cert" {
  domain_name               = var.domain_name
  validation_method         = "DNS"
  subject_alternative_names = var.subject_alternative_names

  lifecycle {
    create_before_destroy = true
  }
}

locals {
  validation_options = {
    for dvo in aws_acm_certificate.this.domain_validation_options :
    dvo.domain_name => dvo
  }
}

## Creates dns validation records

resource "cloudflare_dns_record" "acm_validation" {
  for_each = local.validation_options

  zone_id = var.cloudflare_zone_id
  name    = each.value.resource_record_name
  type    = each.value.resource_record_type
  content = each.value.resource_record_value
  ttl     = 60
  proxied = false
}

## Ask acm to validate and wait until cert is issued

resource "aws_acm_certificate_validation" "cert_validation" {
  certificate_arn = aws_acm_certificate.cert.arn

  validation_record_fqdns = [for record in cloudflare_dns_record.validation : record.name]

  depends_on = [cloudflare_dns_record.acm_validation]
}

## DNS record to point domain to ALB

resource "cloudflare_dns_record" "root" {
  zone_id = var.cloudflare_zone_id
  name    = "@"
  content = var.alb_dns_name
  type    = "CNAME"
  ttl     = 1
  proxied = false

  depends_on = [aws_acm_certificate_validation.cert_validation]
}

## DNS record to point subdomain to ALB

resource "cloudflare_dns_record" "app" {
  zone_id = var.cloudflare_zone_id
  name    = var.dns_record_name
  content = var.alb_dns_name
  type    = "CNAME"
  ttl     = 1
  proxied = false

  depends_on = [aws_acm_certificate_validation.cert_validation]
}