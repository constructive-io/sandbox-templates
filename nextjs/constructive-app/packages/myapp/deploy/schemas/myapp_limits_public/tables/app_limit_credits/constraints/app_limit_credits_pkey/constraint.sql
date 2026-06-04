-- Deploy: schemas/myapp_limits_public/tables/app_limit_credits/constraints/app_limit_credits_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_credits/table


ALTER TABLE myapp_limits_public.app_limit_credits 
  ADD CONSTRAINT app_limit_credits_pkey PRIMARY KEY (id);

