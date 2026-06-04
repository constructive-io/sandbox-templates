-- Deploy: schemas/myapp_limits_public/tables/app_limit_credit_code_items/columns/id/alterations/alt0000000118
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_credit_code_items/table
-- requires: schemas/myapp_limits_public/tables/app_limit_credit_code_items/columns/id/column


ALTER TABLE myapp_limits_public.app_limit_credit_code_items 
  ALTER COLUMN id SET NOT NULL;

