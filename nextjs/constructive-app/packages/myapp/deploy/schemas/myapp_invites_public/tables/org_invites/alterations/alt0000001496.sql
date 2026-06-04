-- Deploy: schemas/myapp_invites_public/tables/org_invites/alterations/alt0000001496
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/org_invites/table


ALTER TABLE myapp_invites_public.org_invites 
  DISABLE ROW LEVEL SECURITY;

