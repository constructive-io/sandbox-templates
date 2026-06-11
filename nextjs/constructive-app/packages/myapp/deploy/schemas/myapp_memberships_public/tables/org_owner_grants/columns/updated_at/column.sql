-- Deploy: schemas/myapp_memberships_public/tables/org_owner_grants/columns/updated_at/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_owner_grants/table


ALTER TABLE myapp_memberships_public.org_owner_grants 
  ADD COLUMN updated_at timestamptz;

