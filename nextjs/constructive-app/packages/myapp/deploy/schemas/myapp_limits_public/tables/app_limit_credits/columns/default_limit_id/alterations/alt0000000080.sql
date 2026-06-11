-- Deploy: schemas/myapp_limits_public/tables/app_limit_credits/columns/default_limit_id/alterations/alt0000000080
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_credits/table
-- requires: schemas/myapp_limits_public/tables/app_limit_credits/columns/default_limit_id/column


ALTER TABLE myapp_limits_public.app_limit_credits 
  ALTER COLUMN default_limit_id SET NOT NULL;

