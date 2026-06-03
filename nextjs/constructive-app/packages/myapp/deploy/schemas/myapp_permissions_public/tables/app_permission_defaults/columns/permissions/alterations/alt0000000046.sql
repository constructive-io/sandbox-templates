-- Deploy: schemas/myapp_permissions_public/tables/app_permission_defaults/columns/permissions/alterations/alt0000000046
-- made with <3 @ constructive.io

-- requires: schemas/myapp_permissions_public/schema
-- requires: schemas/myapp_permissions_public/tables/app_permission_defaults/columns/permissions/column


COMMENT ON COLUMN myapp_permissions_public.app_permission_defaults.permissions IS 'Default permission bitmask applied to new members';

