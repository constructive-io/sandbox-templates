-- Verify: schemas/myapp_auth_private/procedures/cleanup_expired_session_secrets/procedure


SELECT verify_function('myapp_auth_private.cleanup_expired_session_secrets');


