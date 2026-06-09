-- Deploy: schemas/myapp_memberships_public/tables/org_permission_default_permissions/columns/id/alterations/alt0000000801
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_permission_default_permissions/table
-- requires: schemas/myapp_memberships_public/tables/org_permission_default_permissions/columns/id/column


ALTER TABLE myapp_memberships_public.org_permission_default_permissions 
  ALTER COLUMN id SET NOT NULL;

