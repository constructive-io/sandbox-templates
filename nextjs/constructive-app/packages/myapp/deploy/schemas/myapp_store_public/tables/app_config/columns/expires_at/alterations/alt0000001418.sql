-- Deploy: schemas/myapp_store_public/tables/app_config/columns/expires_at/alterations/alt0000001418
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_public/schema
-- requires: schemas/myapp_store_public/tables/app_config/columns/expires_at/column


COMMENT ON COLUMN myapp_store_public.app_config.expires_at IS E'Optional expiration timestamp for time-limited config entries';

