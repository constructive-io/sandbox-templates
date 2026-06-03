-- Deploy: schemas/myapp_memberships_public/tables/app_memberships/columns/is_disabled/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/app_memberships/table


ALTER TABLE myapp_memberships_public.app_memberships 
  ADD COLUMN is_disabled boolean;

