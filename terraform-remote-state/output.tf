output "dynamodb_table_id" {
    value = module.remote_state.dynamodb_table.id
}

output "state_bucket" {
    value = module.remote_state.state_bucket.bucket
}

output "kms_key_id" {
    value = module.remote_state.kms_key.id
}

