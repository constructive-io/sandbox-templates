-- Deploy: schemas/myapp_memberships_public/tables/app_permission_default_grants/policies/enable_row_level_security
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/app_permission_default_grants/table


ALTER TABLE myapp_memberships_public.app_permission_default_grants 
  ENABLE ROW LEVEL SECURITY;

