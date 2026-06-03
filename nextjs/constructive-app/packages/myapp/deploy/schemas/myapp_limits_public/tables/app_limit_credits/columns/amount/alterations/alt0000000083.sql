-- Deploy: schemas/myapp_limits_public/tables/app_limit_credits/columns/amount/alterations/alt0000000083
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_credits/table
-- requires: schemas/myapp_limits_public/tables/app_limit_credits/columns/amount/column


ALTER TABLE myapp_limits_public.app_limit_credits 
  ALTER COLUMN amount SET NOT NULL;

