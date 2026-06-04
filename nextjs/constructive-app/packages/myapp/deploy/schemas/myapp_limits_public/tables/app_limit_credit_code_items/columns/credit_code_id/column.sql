-- Deploy: schemas/myapp_limits_public/tables/app_limit_credit_code_items/columns/credit_code_id/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_credit_code_items/table


ALTER TABLE myapp_limits_public.app_limit_credit_code_items 
  ADD COLUMN credit_code_id uuid;

