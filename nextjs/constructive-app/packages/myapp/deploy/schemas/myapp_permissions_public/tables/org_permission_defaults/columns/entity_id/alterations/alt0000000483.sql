-- Deploy: schemas/myapp_permissions_public/tables/org_permission_defaults/columns/entity_id/alterations/alt0000000483
-- made with <3 @ constructive.io

-- requires: schemas/myapp_permissions_public/schema
-- requires: schemas/myapp_permissions_public/tables/org_permission_defaults/table
-- requires: schemas/myapp_permissions_public/tables/org_permission_defaults/columns/entity_id/column


ALTER TABLE myapp_permissions_public.org_permission_defaults 
  ALTER COLUMN entity_id SET NOT NULL;

