-- Deploy: schemas/myapp_invites_public/tables/org_invites/columns/expires_at/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/org_invites/table


ALTER TABLE myapp_invites_public.org_invites 
  ADD COLUMN expires_at timestamptz;

