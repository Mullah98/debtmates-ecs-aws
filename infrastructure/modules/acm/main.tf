## Req an acm certificate

resource "aws_acm_certificate" "cert" {
  domain_name               = var.domain_name
  validation_method         = "DNS"
  subject_alternative_names = var.subject_alternative_names

  lifecycle {
    create_before_destroy = true
  }
}


## Creates dns validation records

resource "cloudflare_dns_record" "acm_validation" {
  for_each = {
    for dvo in aws_acm_certificate.cert.domain_validation_options :
    dvo.domain_name => {
      name  = dvo.resource_record_name
      type  = dvo.resource_record_type
      value = dvo.resource_record_value
    }
  }

  zone_id = var.cloudflare_zone_id
  name    = trimsuffix(trimsuffix(each.value.name, "."), ".${var.domain_name}")
  type    = each.value.type
  content = each.value.value
  ttl     = 60
  proxied = false
}

## Ask acm to validate and wait until cert is issued

resource "aws_acm_certificate_validation" "cert_validation" {
  certificate_arn = aws_acm_certificate.cert.arn

  validation_record_fqdns = [
    for dvo in aws_acm_certificate.cert.domain_validation_options :
    trimsuffix(dvo.resource_record_name, ".")
  ]

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

  depends_on = [ aws_acm_certificate_validation.cert_validation ]
}

## DNS record to point subdomain to ALB

resource "cloudflare_dns_record" "app" {
  zone_id = var.cloudflare_zone_id
  name    = var.dns_record_name
  content = var.alb_dns_name
  type    = "CNAME"
  ttl     = 1
  proxied = false

  depends_on = [ aws_acm_certificate_validation.cert_validation ]
}