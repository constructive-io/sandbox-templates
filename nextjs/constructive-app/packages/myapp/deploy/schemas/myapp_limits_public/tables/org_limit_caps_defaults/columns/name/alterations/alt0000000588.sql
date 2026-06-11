-- Deploy: schemas/myapp_limits_public/tables/org_limit_caps_defaults/columns/name/alterations/alt0000000588
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_caps_defaults/columns/name/column


COMMENT ON COLUMN myapp_limits_public.org_limit_caps_defaults.name IS E'Name identifier of the cap (e.g. max_file_upload_size, advanced_analytics)';

