-- Deploy: schemas/myapp_limits_public/tables/app_limit_credit_redemptions/columns/id/alterations/alt0000000132
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_credit_redemptions/table
-- requires: schemas/myapp_limits_public/tables/app_limit_credit_redemptions/columns/id/column


ALTER TABLE myapp_limits_public.app_limit_credit_redemptions 
  ALTER COLUMN id SET DEFAULT uuidv7();

