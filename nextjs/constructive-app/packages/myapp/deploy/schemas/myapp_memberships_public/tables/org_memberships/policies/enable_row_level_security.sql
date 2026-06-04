-- Deploy: schemas/myapp_memberships_public/tables/org_memberships/policies/enable_row_level_security
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_memberships/table


ALTER TABLE myapp_memberships_public.org_memberships 
  ENABLE ROW LEVEL SECURITY;

