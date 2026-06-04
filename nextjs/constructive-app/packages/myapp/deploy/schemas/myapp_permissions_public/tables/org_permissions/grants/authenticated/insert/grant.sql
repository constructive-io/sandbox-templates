-- Deploy: schemas/myapp_permissions_public/tables/org_permissions/grants/authenticated/insert/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_permissions_public/schema
-- requires: schemas/myapp_permissions_public/tables/org_permissions/table


GRANT INSERT ON myapp_permissions_public.org_permissions TO authenticated;

