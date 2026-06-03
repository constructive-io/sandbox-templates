-- Deploy: schemas/myapp_limits_public/tables/app_limit_credit_redemptions/constraints/app_limit_credit_redemptions_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_credit_redemptions/table


ALTER TABLE myapp_limits_public.app_limit_credit_redemptions 
  ADD CONSTRAINT app_limit_credit_redemptions_pkey PRIMARY KEY (id);

