-- Deploy: schemas/myapp_limits_public/tables/app_limit_caps/columns/max/alterations/alt0000000157
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_caps/table
-- requires: schemas/myapp_limits_public/tables/app_limit_caps/columns/max/column


ALTER TABLE myapp_limits_public.app_limit_caps 
  ALTER COLUMN max SET DEFAULT 0;

