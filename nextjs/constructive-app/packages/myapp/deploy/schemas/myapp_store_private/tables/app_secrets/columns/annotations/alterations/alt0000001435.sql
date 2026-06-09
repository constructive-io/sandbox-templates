-- Deploy: schemas/myapp_store_private/tables/app_secrets/columns/annotations/alterations/alt0000001435
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_store_private/tables/app_secrets/columns/annotations/column


COMMENT ON COLUMN myapp_store_private.app_secrets.annotations IS 'Freeform metadata for tooling and operational notes';

