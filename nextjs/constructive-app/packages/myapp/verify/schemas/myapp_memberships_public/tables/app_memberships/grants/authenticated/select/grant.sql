-- Verify: schemas/myapp_memberships_public/tables/app_memberships/grants/authenticated/select/grant


SELECT verify_table_grant('myapp_memberships_public.app_memberships', 'select', 'authenticated');


