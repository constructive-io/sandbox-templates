-- Deploy: schemas/myapp_invites_public/tables/org_invites/columns/invite_valid/alterations/alt0000001509
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/org_invites/table
-- requires: schemas/myapp_invites_public/tables/org_invites/columns/invite_valid/column


ALTER TABLE myapp_invites_public.org_invites 
  ALTER COLUMN invite_valid SET DEFAULT true;

