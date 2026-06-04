-- Deploy: schemas/myapp_invites_public/tables/org_invites/columns/is_read_only/alterations/alt0000001522
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/org_invites/table
-- requires: schemas/myapp_invites_public/tables/org_invites/columns/is_read_only/column


ALTER TABLE myapp_invites_public.org_invites 
  ALTER COLUMN is_read_only SET NOT NULL;

