resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "main-vpc"
  }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id
}

resource "aws_subnet" "public_subnet_2a" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidr[0]
  availability_zone       = var.availability_zone[0]
  map_public_ip_on_launch = true ## ??
}

resource "aws_subnet" "private_subnet_2a" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnet_cidr[0]
  availability_zone = var.availability_zone[0]
}

resource "aws_subnet" "public_subnet_2b" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidr[1]
  availability_zone       = var.availability_zone[1]
  map_public_ip_on_launch = true ## ??
}

resource "aws_subnet" "private_subnet_2b" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnet_cidr[1]
  availability_zone = var.availability_zone[1]
}

resource "aws_nat_gateway" "nat_1" {
  allocation_id = aws_eip.eip1.id
  subnet_id     = aws_subnet.public_subnet_2a.id

  tags = {
    Name = "public-subnet-2a-nat"
  }

  depends_on = [aws_internet_gateway.igw]
}

resource "aws_nat_gateway" "nat_2" {
  allocation_id = aws_eip.eip2.id
  subnet_id     = aws_subnet.public_subnet_2b.id

  tags = {
    Name = "public-subnet-2b-nat"
  }

  depends_on = [aws_internet_gateway.igw]
}

resource "aws_eip" "eip1" {
  domain = "vpc"
}

resource "aws_eip" "eip2" {
  domain = "vpc"
}

resource "aws_route_table" "public_route_table" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = var.ipv4_default_route
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = "public-route-table"
  }
}

resource "aws_route_table" "private_route_table_2a" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = var.ipv4_default_route
    nat_gateway_id = aws_nat_gateway.nat_1.id
  }

  tags = {
    Name = "private-route-table-2a"
  }
}

resource "aws_route_table" "private_route_table_2b" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = var.ipv4_default_route
    nat_gateway_id = aws_nat_gateway.nat_2.id
  }

  tags = {
    Name = "private-route-table-2b"
  }
}

resource "aws_route_table_association" "public_2a_route_association" {
  subnet_id      = aws_subnet.public_subnet_2a.id
  route_table_id = aws_route_table.public_route_table.id
}

resource "aws_route_table_association" "public_2b_route_association" {
  subnet_id      = aws_subnet.public_subnet_2b.id
  route_table_id = aws_route_table.public_route_table.id
}

resource "aws_route_table_association" "private_2a_route_association" {
  subnet_id      = aws_subnet.private_subnet_2a.id
  route_table_id = aws_route_table.private_route_table_2a.id
}

resource "aws_route_table_association" "private_2b_route_association" {
  subnet_id      = aws_subnet.private_subnet_2b.id
  route_table_id = aws_route_table.private_route_table_2b.id
}