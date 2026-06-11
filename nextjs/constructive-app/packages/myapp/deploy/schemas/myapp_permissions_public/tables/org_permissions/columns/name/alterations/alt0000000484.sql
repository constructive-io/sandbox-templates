-- Deploy: schemas/myapp_permissions_public/tables/org_permissions/columns/name/alterations/alt0000000484
-- made with <3 @ constructive.io

-- requires: schemas/myapp_permissions_public/schema
-- requires: schemas/myapp_permissions_public/tables/org_permissions/columns/name/column


COMMENT ON COLUMN myapp_permissions_public.org_permissions.name IS E'Human-readable permission name (e.g. read, write, manage)';

