-- Verify: schemas/myapp_memberships_public/tables/app_owner_grants/grants/authenticated/select/grant


SELECT verify_table_grant('myapp_memberships_public.app_owner_grants', 'select', 'authenticated');


