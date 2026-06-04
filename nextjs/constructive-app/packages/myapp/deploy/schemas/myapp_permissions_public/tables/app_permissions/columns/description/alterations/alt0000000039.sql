-- Deploy: schemas/myapp_permissions_public/tables/app_permissions/columns/description/alterations/alt0000000039
-- made with <3 @ constructive.io

-- requires: schemas/myapp_permissions_public/schema
-- requires: schemas/myapp_permissions_public/tables/app_permissions/columns/description/column


COMMENT ON COLUMN myapp_permissions_public.app_permissions.description IS E'Human-readable description of what this permission allows';

