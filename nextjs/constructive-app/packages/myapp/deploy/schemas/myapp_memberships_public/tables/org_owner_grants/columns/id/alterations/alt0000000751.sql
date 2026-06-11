-- Deploy: schemas/myapp_memberships_public/tables/org_owner_grants/columns/id/alterations/alt0000000751
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_owner_grants/table
-- requires: schemas/myapp_memberships_public/tables/org_owner_grants/columns/id/column


ALTER TABLE myapp_memberships_public.org_owner_grants 
  ALTER COLUMN id SET NOT NULL;

