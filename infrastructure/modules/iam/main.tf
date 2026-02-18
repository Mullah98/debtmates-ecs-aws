## Create IAM OIDC identity provider to assume IAM roles in AWS via ferated auth.

resource "aws_iam_openid_connect_provider" "github" {
  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"]
}

resource "aws_iam_role" "github_actions_role" {
  name = "github-actions-role"
  assume_role_policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [{
      "Effect" : "Allow",
      "Principal" : {
        "Federated" : aws_iam_openid_connect_provider.github.arn
      },
      "Action" : "sts:AssumeRoleWithWebIdentity",
      "Condition" : {
        "StringEquals" : {
          "token.actions.githubusercontent.com:aud" : "sts.amazonaws.com"
        },
        "StringLike" : {
          "token.actions.githubusercontent.com:sub" : "repo:${var.github_org}/${var.github_repo}:*"
        }
      }
    }]
  })
}

resource "aws_iam_role_policy" "github_actions_policy" {
  name = "github-actions-policy"
  role = aws_iam_role.github_actions_role.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid      = "ECRAuthToken",
        Effect   = "Allow",
        Action   = ["ecr:GetAuthorizationToken"],
        Resource = "*"
      },
      {
        Sid    = "ECRAccess",
        Effect = "Allow",
        Action = [
          "ecr:BatchCheckLayerAvailability",
          "ecr:PutImage",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage"
        ],
        Resource = var.ecr_repository_arn
      },
      {
        Sid      = "S3ListBucket",
        Effect   = "Allow",
        Action   = ["s3:ListBucket"],
        Resource = var.s3_bucket_arn
      },
      {
        Sid    = "S3Access",
        Effect = "Allow",
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ],
        Resource = "${var.s3_bucket_arn}/*"
      },
      {
        Sid    = "DynamoDBAccess",
        Effect = "Allow",
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:DeleteItem",
          "dynamodb:UpdateItem",
          "dynamodb:DescribeTable"
        ],
        Resource = var.dynamodb_table_arn
      },
      {
        Sid      = "ECSAccess",
        Effect   = "Allow",
        Action   = ["ecs:*", "logs:*"],
        Resource = "*"
      },
      {
        Sid      = "EC2FullAccess",
        Effect   = "Allow",
        Action   = ["ec2:*"],
        Resource = "*"
      },
      {
        Sid    = "IAMAccess",
        Effect = "Allow",
        Action = [
          "iam:GetRole",
          "iam:CreateRole",
          "iam:DeleteRole",
          "iam:UpdateRole",
          "iam:PutRolePolicy",
          "iam:DeleteRolePolicy",
          "iam:GetRolePolicy",
          "iam:PassRole",
          "iam:ListAttachedRolePolicies",
          "iam:AttachRolePolicy",
          "iam:DetachRolePolicy"
        ],
        Resource = "*"
      },
      {
        Sid    = "ACMAccess",
        Effect = "Allow",
        Action = [
          "acm:RequestCertificate",
          "acm:DescribeCertificate",
          "acm:DeleteCertificate",
          "acm:ListCertificates",
          "acm:AddTagsToCertificate",
          "acm:RemoveTagsFromCertificate"
        ],
        Resource = "*"
      },
      {
        Sid      = "ELBAccess",
        Effect   = "Allow",
        Action   = ["elasticloadbalancing:*"],
        Resource = "*"
      }
    ]
  })
}