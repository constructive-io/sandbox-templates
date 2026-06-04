-- Deploy: schemas/myapp_limits_public/tables/app_limit_credit_code_items/constraints/app_limit_credit_code_items_credit_code_id_default_limit_id_key/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_credit_code_items/table


ALTER TABLE myapp_limits_public.app_limit_credit_code_items 
  ADD CONSTRAINT app_limit_credit_code_items_credit_code_id_default_limit_id_key 
    UNIQUE (credit_code_id, default_limit_id);

