-- Deploy: schemas/myapp_memberships_public/tables/org_permission_default_permissions/columns/created_at/alterations/alt0000000807
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_permission_default_permissions/table
-- requires: schemas/myapp_memberships_public/tables/org_permission_default_permissions/columns/created_at/column


ALTER TABLE myapp_memberships_public.org_permission_default_permissions 
  ALTER COLUMN created_at SET DEFAULT now();

