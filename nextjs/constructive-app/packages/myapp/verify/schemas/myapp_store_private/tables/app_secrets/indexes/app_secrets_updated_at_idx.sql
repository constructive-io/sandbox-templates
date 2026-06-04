-- Verify: schemas/myapp_store_private/tables/app_secrets/indexes/app_secrets_updated_at_idx


SELECT verify_index('myapp_store_private.app_secrets', 'app_secrets_updated_at_idx');


