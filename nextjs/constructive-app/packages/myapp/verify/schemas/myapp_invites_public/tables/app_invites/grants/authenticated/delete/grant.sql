-- Verify: schemas/myapp_invites_public/tables/app_invites/grants/authenticated/delete/grant


SELECT verify_table_grant('myapp_invites_public.app_invites', 'delete', 'authenticated');


