-- Deploy: schemas/myapp_memberships_public/tables/app_grants/columns/is_grant/alterations/alt0000000274
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/app_grants/table
-- requires: schemas/myapp_memberships_public/tables/app_grants/columns/is_grant/column


ALTER TABLE myapp_memberships_public.app_grants 
  ALTER COLUMN is_grant SET DEFAULT true;

