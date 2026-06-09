-- Deploy: schemas/myapp_memberships_public/tables/org_permission_default_permissions/policies/enable_row_level_security
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_permission_default_permissions/table


ALTER TABLE myapp_memberships_public.org_permission_default_permissions 
  ENABLE ROW LEVEL SECURITY;

