-- Deploy: schemas/myapp_limits_public/tables/org_limit_warnings/columns/name/alterations/alt0000000608
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_warnings/columns/name/column


COMMENT ON COLUMN myapp_limits_public.org_limit_warnings.name IS E'Limit name this warning applies to (must match a default_limits entry)';

