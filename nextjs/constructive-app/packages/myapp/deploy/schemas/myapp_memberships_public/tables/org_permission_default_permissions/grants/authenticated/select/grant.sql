-- Deploy: schemas/myapp_memberships_public/tables/org_permission_default_permissions/grants/authenticated/select/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_permission_default_permissions/table


GRANT SELECT ON myapp_memberships_public.org_permission_default_permissions TO authenticated;

