terraform {
  backend "s3" {
    bucket = "tf-remote-state20240615101729664100000002"
    key            = "neosim/output-bucket/terraform.tfstate"
    region         = "eu-north-1"
    encrypt        = true
    kms_key_id     = "53f98ade-e94a-429c-a51c-57100e21dac9"
    dynamodb_table = "tf-remote-state-lock"
  }
}

provider "aws" {
  region = "eu-north-1"
}

locals {
  bucket_name = "neosim5-minecraft-connections-output"
}

resource "aws_s3_bucket" "my_bucket" {
  bucket = local.bucket_name
  acl    = "private"
}

resource "aws_iam_user" "s3_user" {
  name = "s3-user"
}

resource "aws_iam_user_policy" "s3_user_policy" {
  name   = "s3-user-policy"
  user   = aws_iam_user.s3_user.name
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:PutObjectAcl"
        ]
        Resource = [
          "${aws_s3_bucket.my_bucket.arn}/*"
        ]
      }
    ]
  })
}

resource "aws_iam_access_key" "s3_user_key" {
  user = aws_iam_user.s3_user.name
}

output "s3_user_access_key" {
  value = aws_iam_access_key.s3_user_key.id
  sensitive = true
}

output "s3_user_secret_key" {
  value = aws_iam_access_key.s3_user_key.secret
  sensitive = true
}