-- Deploy: schemas/myapp_limits_public/tables/app_limit_credit_code_items/columns/amount/alterations/alt0000000125
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_credit_code_items/columns/amount/column


COMMENT ON COLUMN myapp_limits_public.app_limit_credit_code_items.amount IS 'Number of credits this item grants per redemption';

