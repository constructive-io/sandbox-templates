-- Deploy: schemas/myapp_limits_public/tables/app_limit_defaults/columns/name/alterations/alt0000000073
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_defaults/columns/name/column


COMMENT ON COLUMN myapp_limits_public.app_limit_defaults.name IS 'Name identifier of the limit this default applies to';

