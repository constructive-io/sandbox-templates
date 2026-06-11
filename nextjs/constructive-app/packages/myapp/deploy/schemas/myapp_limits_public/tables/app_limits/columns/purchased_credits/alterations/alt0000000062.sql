-- Deploy: schemas/myapp_limits_public/tables/app_limits/columns/purchased_credits/alterations/alt0000000062
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limits/table
-- requires: schemas/myapp_limits_public/tables/app_limits/columns/purchased_credits/column


ALTER TABLE myapp_limits_public.app_limits 
  ALTER COLUMN purchased_credits SET DEFAULT 0;

