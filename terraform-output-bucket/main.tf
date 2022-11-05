terraform {
  backend "s3" {
    bucket = "tf-remote-state20221105094239446500000002"
    key            = "neosim/output-bucket/terraform.tfstate"
    region         = "eu-north-1"
    encrypt        = true
    kms_key_id     = "6d4419e3-c651-494c-affa-38d4e3c0c4c7"
    dynamodb_table = "tf-remote-state-lock"
  }
}

provider "aws" {
  region = "eu-north-1"
}

module "s3-output" {
  source = "terraform-aws-modules/s3-bucket/aws"

  create_bucket = true

  bucket = "neosim-minecraft-connections-output"
  acl    = "public-read"

  force_destroy = true

  versioning = {
    enabled = false
  }

  # S3 bucket-level Public Access Block configuration
  block_public_acls       = false
  block_public_policy     = true
  ignore_public_acls      = false
  restrict_public_buckets = true

}