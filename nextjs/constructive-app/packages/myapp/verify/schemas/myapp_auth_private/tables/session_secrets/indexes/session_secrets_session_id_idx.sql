-- Verify: schemas/myapp_auth_private/tables/session_secrets/indexes/session_secrets_session_id_idx


SELECT verify_index('myapp_auth_private.session_secrets', 'session_secrets_session_id_idx');


