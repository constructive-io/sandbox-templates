-- Deploy: schemas/myapp_limits_public/tables/app_limit_credit_codes/columns/id/alterations/alt0000000107
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_credit_codes/table
-- requires: schemas/myapp_limits_public/tables/app_limit_credit_codes/columns/id/column


ALTER TABLE myapp_limits_public.app_limit_credit_codes 
  ALTER COLUMN id SET NOT NULL;

