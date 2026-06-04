-- Deploy: schemas/myapp_limits_public/tables/org_limit_caps/columns/name/alterations/alt0000000582
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_caps/columns/name/column


COMMENT ON COLUMN myapp_limits_public.org_limit_caps.name IS 'Name identifier of the cap being overridden';

