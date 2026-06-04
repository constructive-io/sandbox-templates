-- Verify: schemas/myapp_memberships_public/tables/org_admin_grants/grants/authenticated/insert/grant


SELECT verify_table_grant('myapp_memberships_public.org_admin_grants', 'insert', 'authenticated');


