-- Verify: schemas/myapp_invites_public/tables/app_invites/grants/authenticated/select/grant


SELECT verify_table_grant('myapp_invites_public.app_invites', 'select', 'authenticated');


