-- Deploy: schemas/myapp_invites_public/tables/org_invites/columns/created_at/alterations/alt0000001528
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/org_invites/table
-- requires: schemas/myapp_invites_public/tables/org_invites/columns/created_at/column


ALTER TABLE myapp_invites_public.org_invites 
  ALTER COLUMN created_at SET DEFAULT now();

