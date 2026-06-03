-- Deploy: schemas/myapp_limits_public/tables/app_limit_credit_code_items/columns/default_limit_id/alterations/alt0000000123
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_credit_code_items/columns/default_limit_id/column


COMMENT ON COLUMN myapp_limits_public.app_limit_credit_code_items.default_limit_id IS E'FK to default_limits — which limit this item grants credits for';

