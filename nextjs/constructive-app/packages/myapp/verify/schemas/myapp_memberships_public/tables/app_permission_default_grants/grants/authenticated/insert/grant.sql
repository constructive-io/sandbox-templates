-- Verify: schemas/myapp_memberships_public/tables/app_permission_default_grants/grants/authenticated/insert/grant


SELECT verify_table_grant('myapp_memberships_public.app_permission_default_grants', 'insert', 'authenticated');


