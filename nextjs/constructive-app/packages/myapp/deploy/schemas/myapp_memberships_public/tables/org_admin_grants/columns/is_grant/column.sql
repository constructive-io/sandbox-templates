-- Deploy: schemas/myapp_memberships_public/tables/org_admin_grants/columns/is_grant/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_admin_grants/table


ALTER TABLE myapp_memberships_public.org_admin_grants 
  ADD COLUMN is_grant boolean;

