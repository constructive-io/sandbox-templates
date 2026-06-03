-- Deploy: schemas/myapp_limits_public/tables/app_limit_credit_redemptions/columns/organization_id/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_credit_redemptions/table


ALTER TABLE myapp_limits_public.app_limit_credit_redemptions 
  ADD COLUMN organization_id uuid;

