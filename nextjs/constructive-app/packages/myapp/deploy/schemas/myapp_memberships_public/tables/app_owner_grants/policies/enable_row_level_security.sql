-- Deploy: schemas/myapp_memberships_public/tables/app_owner_grants/policies/enable_row_level_security
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/app_owner_grants/table


ALTER TABLE myapp_memberships_public.app_owner_grants 
  ENABLE ROW LEVEL SECURITY;

