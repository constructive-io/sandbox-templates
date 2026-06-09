-- Deploy: schemas/myapp_permissions_public/tables/org_permission_defaults/columns/entity_id/alterations/alt0000000499
-- made with <3 @ constructive.io

-- requires: schemas/myapp_permissions_public/schema
-- requires: schemas/myapp_permissions_public/tables/org_permission_defaults/columns/entity_id/column


COMMENT ON COLUMN myapp_permissions_public.org_permission_defaults.entity_id IS 'References the entity these default permissions apply to';

