-- Deploy: schemas/myapp_invites_public/tables/org_invites/columns/invite_limit/alterations/alt0000001560
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/org_invites/table
-- requires: schemas/myapp_invites_public/tables/org_invites/columns/invite_limit/column


ALTER TABLE myapp_invites_public.org_invites 
  ALTER COLUMN invite_limit SET NOT NULL;

