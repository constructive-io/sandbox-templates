-- Deploy: schemas/myapp_permissions_public/tables/org_permission_defaults/grants/authenticated/delete/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_permissions_public/schema
-- requires: schemas/myapp_permissions_public/tables/org_permission_defaults/table


GRANT DELETE ON myapp_permissions_public.org_permission_defaults TO authenticated;

