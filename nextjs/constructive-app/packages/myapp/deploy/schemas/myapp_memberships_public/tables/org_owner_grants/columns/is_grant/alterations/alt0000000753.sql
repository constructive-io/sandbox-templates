-- Deploy: schemas/myapp_memberships_public/tables/org_owner_grants/columns/is_grant/alterations/alt0000000753
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_owner_grants/table
-- requires: schemas/myapp_memberships_public/tables/org_owner_grants/columns/is_grant/column


ALTER TABLE myapp_memberships_public.org_owner_grants 
  ALTER COLUMN is_grant SET NOT NULL;

