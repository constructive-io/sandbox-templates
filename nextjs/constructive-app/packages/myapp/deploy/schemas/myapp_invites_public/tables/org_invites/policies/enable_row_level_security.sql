-- Deploy: schemas/myapp_invites_public/tables/org_invites/policies/enable_row_level_security
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/org_invites/table


ALTER TABLE myapp_invites_public.org_invites 
  ENABLE ROW LEVEL SECURITY;

