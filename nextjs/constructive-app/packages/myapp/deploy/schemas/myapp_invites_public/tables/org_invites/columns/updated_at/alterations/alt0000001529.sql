-- Deploy: schemas/myapp_invites_public/tables/org_invites/columns/updated_at/alterations/alt0000001529
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/org_invites/table
-- requires: schemas/myapp_invites_public/tables/org_invites/columns/updated_at/column


ALTER TABLE myapp_invites_public.org_invites 
  ALTER COLUMN updated_at SET DEFAULT now();

