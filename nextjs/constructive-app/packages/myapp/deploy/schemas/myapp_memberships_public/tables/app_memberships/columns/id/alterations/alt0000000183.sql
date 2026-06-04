-- Deploy: schemas/myapp_memberships_public/tables/app_memberships/columns/id/alterations/alt0000000183
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/app_memberships/table
-- requires: schemas/myapp_memberships_public/tables/app_memberships/columns/id/column


ALTER TABLE myapp_memberships_public.app_memberships 
  ALTER COLUMN id SET NOT NULL;

