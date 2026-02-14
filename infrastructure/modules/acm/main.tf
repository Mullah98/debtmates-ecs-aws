## Req an acm certificate

resource "aws_acm_certificate" "cert" {
  domain_name = var.domain_name
  validation_method = "DNS"
  subject_alternative_names = var.subject_alternative_names
}


## Creates dns validation records

resource "cloudflare_dns_record" "acm_validation" {
  for_each = {
    for dvo in aws_acm_certificate.cert.domain_validation_options :
    dvo.resource_record_name => {
        name = dvo.resource_record_name
        type = dvo.resource_record_type
        value = dvo.resource_record_value
    }...
  }

  zone_id = var.cloudflare_zone_id
  name = each.value[0].name
  content = each.value[0].value
  type = each.value[0].type
  ttl = 60
  proxied = false
}

## Ask acm to validate and wait until cert is issued

resource "aws_acm_certificate_validation" "cert_validation" {
  certificate_arn = aws_acm_certificate.cert.arn

  validation_record_fqdns = [
    for r in cloudflare_dns_record.acm_validation : r.name
  ]
}

## DNS record to point domain to ALB

resource "cloudflare_dns_record" "root" {
  zone_id = var.cloudflare_zone_id
  name = "@"
  content = var.alb_dns_name
  type = "CNAME"
  ttl = 1
  proxied = false
}

## DNS record to point subdomain to ALB

resource "cloudflare_dns_record" "app" {
  zone_id = var.cloudflare_zone_id
  name = var.dns_record_name
  content = var.alb_dns_name
  type = "CNAME"
  ttl = 1
  proxied = false
}