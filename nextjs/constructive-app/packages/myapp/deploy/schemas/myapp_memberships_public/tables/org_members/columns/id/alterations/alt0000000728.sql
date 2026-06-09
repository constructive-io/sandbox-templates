-- Deploy: schemas/myapp_memberships_public/tables/org_members/columns/id/alterations/alt0000000728
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_members/table
-- requires: schemas/myapp_memberships_public/tables/org_members/columns/id/column


ALTER TABLE myapp_memberships_public.org_members 
  ALTER COLUMN id SET DEFAULT uuidv7();

