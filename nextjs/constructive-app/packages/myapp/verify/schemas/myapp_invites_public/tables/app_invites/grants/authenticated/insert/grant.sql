-- Verify: schemas/myapp_invites_public/tables/app_invites/grants/authenticated/insert/grant


SELECT verify_table_grant('myapp_invites_public.app_invites', 'insert', 'authenticated');


