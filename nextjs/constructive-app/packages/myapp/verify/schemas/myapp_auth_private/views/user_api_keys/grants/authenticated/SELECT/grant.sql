-- Verify: schemas/myapp_auth_private/views/user_api_keys/grants/authenticated/SELECT/grant


SELECT verify_table_grant('myapp_auth_private.user_api_keys', 'SELECT', 'authenticated');


