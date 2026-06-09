-- Deploy: schemas/myapp_memberships_public/tables/app_permission_default_permissions/grants/authenticated/delete/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/app_permission_default_permissions/table


GRANT DELETE ON myapp_memberships_public.app_permission_default_permissions TO authenticated;

