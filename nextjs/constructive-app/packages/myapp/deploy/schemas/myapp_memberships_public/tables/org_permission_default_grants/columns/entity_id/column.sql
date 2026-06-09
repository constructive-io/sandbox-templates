-- Deploy: schemas/myapp_memberships_public/tables/org_permission_default_grants/columns/entity_id/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_permission_default_grants/table


ALTER TABLE myapp_memberships_public.org_permission_default_grants 
  ADD COLUMN entity_id uuid;

