-- Deploy: schemas/myapp_permissions_public/tables/app_permissions/columns/bitstr/alterations/alt0000000038
-- made with <3 @ constructive.io

-- requires: schemas/myapp_permissions_public/schema
-- requires: schemas/myapp_permissions_public/tables/app_permissions/columns/bitstr/column


COMMENT ON COLUMN myapp_permissions_public.app_permissions.bitstr IS E'Pre-computed bitmask with only this permission bit set, used for bitwise OR/AND operations';

