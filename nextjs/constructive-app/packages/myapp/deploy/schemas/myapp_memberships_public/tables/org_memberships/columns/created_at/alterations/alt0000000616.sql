-- Deploy: schemas/myapp_memberships_public/tables/org_memberships/columns/created_at/alterations/alt0000000616
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_memberships/table
-- requires: schemas/myapp_memberships_public/tables/org_memberships/columns/created_at/column


ALTER TABLE myapp_memberships_public.org_memberships 
  ALTER COLUMN created_at SET DEFAULT now();

