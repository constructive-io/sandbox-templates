-- Deploy: schemas/myapp_invites_public/tables/org_invites/columns/channel/alterations/alt0000001546
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/org_invites/table
-- requires: schemas/myapp_invites_public/tables/org_invites/columns/channel/column


ALTER TABLE myapp_invites_public.org_invites 
  ALTER COLUMN channel SET DEFAULT 'email';

