-- Deploy: schemas/myapp_limits_public/tables/app_limits/columns/plan_max/alterations/alt0000000060
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limits/table
-- requires: schemas/myapp_limits_public/tables/app_limits/columns/plan_max/column


ALTER TABLE myapp_limits_public.app_limits 
  ALTER COLUMN plan_max SET DEFAULT 0;

