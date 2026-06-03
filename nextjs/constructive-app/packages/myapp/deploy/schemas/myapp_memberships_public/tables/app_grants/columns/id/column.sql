-- Deploy: schemas/myapp_memberships_public/tables/app_grants/columns/id/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/app_grants/table


ALTER TABLE myapp_memberships_public.app_grants 
  ADD COLUMN id uuid;

