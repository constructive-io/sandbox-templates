-- Deploy: schemas/myapp_limits_public/tables/app_limit_credit_code_items/columns/default_limit_id/alterations/alt0000000122
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_credit_code_items/table
-- requires: schemas/myapp_limits_public/tables/app_limit_credit_code_items/columns/default_limit_id/column


ALTER TABLE myapp_limits_public.app_limit_credit_code_items 
  ALTER COLUMN default_limit_id SET NOT NULL;

