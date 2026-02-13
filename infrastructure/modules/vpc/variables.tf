variable "availability_zone" {
  type = list(string)
  description = "List of availability zones for subnets"
}

variable "vpc_cidr" {
  type = string
  description = "CIDR block for VPC"
}

variable "public_subnet_cidr" {
  type = list(string)
  description = "CIDR blocks for public subnets"
}

variable "private_subnet_cidr" {
  type = list(string)
  description = "CIDR blocks for private subnets"
}

variable "ipv4_default_route" {
  type = string
  description = "IPv4 default route used for internet-bound traffic in route tables"
  default = "0.0.0.0/0"
}