-- Deploy: schemas/myapp_permissions_public/tables/org_permissions/columns/id/alterations/alt0000000467
-- made with <3 @ constructive.io

-- requires: schemas/myapp_permissions_public/schema
-- requires: schemas/myapp_permissions_public/tables/org_permissions/table
-- requires: schemas/myapp_permissions_public/tables/org_permissions/columns/id/column


ALTER TABLE myapp_permissions_public.org_permissions 
  ALTER COLUMN id SET NOT NULL;

