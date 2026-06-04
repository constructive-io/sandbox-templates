-- Deploy: schemas/myapp_memberships_public/tables/org_memberships/columns/is_external/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_memberships/table


ALTER TABLE myapp_memberships_public.org_memberships 
  ADD COLUMN is_external boolean;

