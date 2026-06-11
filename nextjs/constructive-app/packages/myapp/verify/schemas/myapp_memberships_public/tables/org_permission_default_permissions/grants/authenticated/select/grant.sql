-- Verify: schemas/myapp_memberships_public/tables/org_permission_default_permissions/grants/authenticated/select/grant


SELECT verify_table_grant('myapp_memberships_public.org_permission_default_permissions', 'select', 'authenticated');


