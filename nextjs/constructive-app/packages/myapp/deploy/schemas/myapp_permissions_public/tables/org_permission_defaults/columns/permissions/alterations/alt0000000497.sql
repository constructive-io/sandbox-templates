-- Deploy: schemas/myapp_permissions_public/tables/org_permission_defaults/columns/permissions/alterations/alt0000000497
-- made with <3 @ constructive.io

-- requires: schemas/myapp_permissions_public/schema
-- requires: schemas/myapp_permissions_public/tables/org_permission_defaults/columns/permissions/column


COMMENT ON COLUMN myapp_permissions_public.org_permission_defaults.permissions IS 'Default permission bitmask applied to new members';

