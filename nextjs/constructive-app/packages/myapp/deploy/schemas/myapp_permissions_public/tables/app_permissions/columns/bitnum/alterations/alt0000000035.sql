-- Deploy: schemas/myapp_permissions_public/tables/app_permissions/columns/bitnum/alterations/alt0000000035
-- made with <3 @ constructive.io

-- requires: schemas/myapp_permissions_public/schema
-- requires: schemas/myapp_permissions_public/tables/app_permissions/columns/bitnum/column


COMMENT ON COLUMN myapp_permissions_public.app_permissions.bitnum IS E'Position of this permission in the bitmask (1-indexed), must be unique per permission set';

