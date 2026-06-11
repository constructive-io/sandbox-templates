-- Deploy: schemas/myapp_limits_public/tables/app_limits/columns/name/alterations/alt0000000052
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limits/columns/name/column


COMMENT ON COLUMN myapp_limits_public.app_limits.name IS 'Name identifier of the limit being tracked';

