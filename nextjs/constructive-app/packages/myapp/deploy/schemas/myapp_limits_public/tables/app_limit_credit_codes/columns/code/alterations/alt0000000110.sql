-- Deploy: schemas/myapp_limits_public/tables/app_limit_credit_codes/columns/code/alterations/alt0000000110
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_credit_codes/columns/code/column


COMMENT ON COLUMN myapp_limits_public.app_limit_credit_codes.code IS E'Human-readable credit code (case-insensitive, unique)';

