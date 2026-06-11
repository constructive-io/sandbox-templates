-- Deploy: schemas/myapp_limits_public/tables/app_limits/columns/purchased_credits/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limits/table


ALTER TABLE myapp_limits_public.app_limits 
  ADD COLUMN purchased_credits bigint;

