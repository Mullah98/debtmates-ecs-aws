variable "availability_zone" {
  type = list(string)
  description = "List of availability zones for subnets"
  default = [ "eu-west-2a", "eu-west-2b" ]
}

variable "vpc_cidr" {
  type = string
  description = "CIDR block for VPC"
  default = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  type = list(string)
  description = "CIDR blocks for public subnets"
  default = [ "10.0.0.0/24", "10.0.2.0/24" ]
}

variable "private_subnet_cidr" {
  type = list(string)
  description = "CIDR blocks for private subnets"
  default = [ "10.0.1.0/24", "10.0.3.0/24" ]
}

variable "ipv4_default_route" {
  type = string
  description = "IPv4 default route used for internet-bound traffic in route tables"
  default = "0.0.0.0/0"
}