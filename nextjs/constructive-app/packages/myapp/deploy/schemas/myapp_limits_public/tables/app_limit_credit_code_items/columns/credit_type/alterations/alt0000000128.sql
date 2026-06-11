-- Deploy: schemas/myapp_limits_public/tables/app_limit_credit_code_items/columns/credit_type/alterations/alt0000000128
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_credit_code_items/columns/credit_type/column


COMMENT ON COLUMN myapp_limits_public.app_limit_credit_code_items.credit_type IS E'Credit durability: permanent (survives window reset) or period (resets on window expiry)';

