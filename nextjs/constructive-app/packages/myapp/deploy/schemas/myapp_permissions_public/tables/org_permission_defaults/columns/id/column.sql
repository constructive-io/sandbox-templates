-- Deploy: schemas/myapp_permissions_public/tables/org_permission_defaults/columns/id/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_permissions_public/schema
-- requires: schemas/myapp_permissions_public/tables/org_permission_defaults/table


ALTER TABLE myapp_permissions_public.org_permission_defaults 
  ADD COLUMN id uuid;

