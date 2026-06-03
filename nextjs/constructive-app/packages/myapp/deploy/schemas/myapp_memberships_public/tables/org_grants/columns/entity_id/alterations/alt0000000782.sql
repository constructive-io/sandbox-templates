-- Deploy: schemas/myapp_memberships_public/tables/org_grants/columns/entity_id/alterations/alt0000000782
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_grants/table
-- requires: schemas/myapp_memberships_public/tables/org_grants/columns/entity_id/column


ALTER TABLE myapp_memberships_public.org_grants 
  ALTER COLUMN entity_id SET NOT NULL;

