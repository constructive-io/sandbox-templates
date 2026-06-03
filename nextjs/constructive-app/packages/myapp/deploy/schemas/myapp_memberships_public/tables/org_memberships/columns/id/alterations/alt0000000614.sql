-- Deploy: schemas/myapp_memberships_public/tables/org_memberships/columns/id/alterations/alt0000000614
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_memberships/table
-- requires: schemas/myapp_memberships_public/tables/org_memberships/columns/id/column


ALTER TABLE myapp_memberships_public.org_memberships 
  ALTER COLUMN id SET NOT NULL;

