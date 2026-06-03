-- Deploy: schemas/myapp_memberships_public/tables/app_memberships/columns/is_disabled/alterations/alt0000000219
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/app_memberships/table
-- requires: schemas/myapp_memberships_public/tables/app_memberships/columns/is_disabled/column


ALTER TABLE myapp_memberships_public.app_memberships 
  ALTER COLUMN is_disabled SET NOT NULL;

