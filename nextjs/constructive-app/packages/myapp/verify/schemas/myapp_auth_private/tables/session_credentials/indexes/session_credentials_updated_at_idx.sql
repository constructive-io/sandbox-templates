-- Verify: schemas/myapp_auth_private/tables/session_credentials/indexes/session_credentials_updated_at_idx


SELECT verify_index('myapp_auth_private.session_credentials', 'session_credentials_updated_at_idx');


