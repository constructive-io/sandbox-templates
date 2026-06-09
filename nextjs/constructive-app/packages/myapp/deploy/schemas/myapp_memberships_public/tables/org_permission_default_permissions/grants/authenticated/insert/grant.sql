-- Deploy: schemas/myapp_memberships_public/tables/org_permission_default_permissions/grants/authenticated/insert/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_permission_default_permissions/table


GRANT INSERT ON myapp_memberships_public.org_permission_default_permissions TO authenticated;

