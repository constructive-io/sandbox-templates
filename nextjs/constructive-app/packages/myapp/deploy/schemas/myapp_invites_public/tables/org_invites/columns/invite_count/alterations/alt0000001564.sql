-- Deploy: schemas/myapp_invites_public/tables/org_invites/columns/invite_count/alterations/alt0000001564
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/org_invites/table
-- requires: schemas/myapp_invites_public/tables/org_invites/columns/invite_count/column


ALTER TABLE myapp_invites_public.org_invites 
  ALTER COLUMN invite_count SET DEFAULT 0;

