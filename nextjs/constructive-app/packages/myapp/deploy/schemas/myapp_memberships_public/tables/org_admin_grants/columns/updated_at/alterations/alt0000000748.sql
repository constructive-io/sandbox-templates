-- Deploy: schemas/myapp_memberships_public/tables/org_admin_grants/columns/updated_at/alterations/alt0000000748
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_admin_grants/table
-- requires: schemas/myapp_memberships_public/tables/org_admin_grants/columns/updated_at/column


ALTER TABLE myapp_memberships_public.org_admin_grants 
  ALTER COLUMN updated_at SET DEFAULT now();

