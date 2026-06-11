-- Deploy: schemas/myapp_limits_public/tables/app_limit_credit_code_items/columns/amount/alterations/alt0000000124
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_credit_code_items/table
-- requires: schemas/myapp_limits_public/tables/app_limit_credit_code_items/columns/amount/column


ALTER TABLE myapp_limits_public.app_limit_credit_code_items 
  ALTER COLUMN amount SET NOT NULL;

