-- Deploy: schemas/myapp_memberships_public/tables/app_permission_default_permissions/columns/id/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/app_permission_default_permissions/table


ALTER TABLE myapp_memberships_public.app_permission_default_permissions 
  ADD COLUMN id uuid;

