-- Verify: schemas/myapp_store_private/tables/user_secrets/grants/authenticated/insert/grant


SELECT verify_table_grant('myapp_store_private.user_secrets', 'insert', 'authenticated');


