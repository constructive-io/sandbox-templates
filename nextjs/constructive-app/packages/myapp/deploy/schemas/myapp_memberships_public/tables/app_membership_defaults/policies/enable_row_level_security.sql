-- Deploy: schemas/myapp_memberships_public/tables/app_membership_defaults/policies/enable_row_level_security
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/app_membership_defaults/table


ALTER TABLE myapp_memberships_public.app_membership_defaults 
  ENABLE ROW LEVEL SECURITY;

