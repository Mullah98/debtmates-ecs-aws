## Create VPC

resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"

  tags = {
    Name = "main-vpc"
  }
}

## Create Internet gateway

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id
}

## Create 2 public & 2 private subnets

resource "aws_subnet" "public_subnet_2a" {
  vpc_id = aws_vpc.main.id
  cidr_block = "10.0.0.0/24"
  availability_zone = "eu-west-2a"
}

resource "aws_subnet" "private_subnet_2a" {
  vpc_id = aws_vpc.main.id
  cidr_block = "10.0.1.0/24"
  availability_zone = "eu-west-2a"
}

resource "aws_subnet" "public_subnet_2b" {
  vpc_id = aws_vpc.main.id
  cidr_block = "10.0.2.0/24"
  availability_zone = "eu-west-2b"
}

resource "aws_subnet" "private_subnet_2b" {
  vpc_id = aws_vpc.main.id
  cidr_block = "10.0.3.0/24"
  availability_zone = "eu-west-2b"
}

## Create NAT gateway

resource "aws_nat_gateway" "nat_1" {
  allocation_id = aws_eip.eip1.id
  subnet_id = aws_subnet.public_subnet_2a.id

  tags = {
    Name = "public-subnet-2a-nat"
  }

  depends_on = [ aws_internet_gateway.igw ] ## ??
}

resource "aws_nat_gateway" "nat_2" {
  allocation_id = aws_eip.eip2.id
  subnet_id = aws_subnet.public_subnet_2b.id

  tags = {
    Name = "public-subnet-2b-nat"
  }

  depends_on = [ aws_internet_gateway.igw ] ## ??
}


## Create Elastic IP

resource "aws_eip" "eip1" {
  domain = "vpc"
}

resource "aws_eip" "eip2" {
  domain = "vpc"
}

## Create route tables

resource "aws_route_table" "public_route_table" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "10.0.0.0/16"
    gateway_id = "local"
  }

  tags = {
    Name = "public-route-table"
  }
}

resource "aws_route_table" "private_route_table" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "10.0.0.0/16"
    gateway_id = "local"
  }

  tags = {
    Name = "private-route-table"
  }
}

## Create associations

resource "aws_route_table_association" "public_2a_route_association" {
  subnet_id = aws_subnet.public_subnet_2a.id
  route_table_id = aws_route_table.public_route_table.id
}

resource "aws_route_table_association" "public_2b_route_association" {
  subnet_id = aws_subnet.public_subnet_2b.id
  route_table_id = aws_route_table.public_route_table.id
}

resource "aws_route_table_association" "private_2a_route_association" {
  subnet_id = aws_subnet.private_subnet_2a.id
  route_table_id = aws_route_table.private_route_table.id
}

resource "aws_route_table_association" "private_2b_route_association" {
  subnet_id = aws_subnet.private_subnet_2b.id
  route_table_id = aws_route_table.private_route_table.id
}