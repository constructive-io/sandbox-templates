-- Deploy: schemas/myapp_invites_public/tables/org_invites/columns/sender_id/alterations/alt0000001501
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/org_invites/table
-- requires: schemas/myapp_invites_public/tables/org_invites/columns/sender_id/column


ALTER TABLE myapp_invites_public.org_invites 
  ALTER COLUMN sender_id SET NOT NULL;

