-- Deploy: schemas/myapp_invites_public/tables/org_invites/columns/expires_at/alterations/alt0000001575
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/org_invites/table
-- requires: schemas/myapp_invites_public/tables/org_invites/columns/expires_at/column


ALTER TABLE myapp_invites_public.org_invites 
  ALTER COLUMN expires_at SET DEFAULT now() + '6 months'::interval;

