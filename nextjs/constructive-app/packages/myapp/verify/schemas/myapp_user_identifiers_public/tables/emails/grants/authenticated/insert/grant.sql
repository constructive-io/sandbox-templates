-- Verify: schemas/myapp_user_identifiers_public/tables/emails/grants/authenticated/insert/grant


SELECT verify_table_grant('myapp_user_identifiers_public.emails', 'insert', 'authenticated');


