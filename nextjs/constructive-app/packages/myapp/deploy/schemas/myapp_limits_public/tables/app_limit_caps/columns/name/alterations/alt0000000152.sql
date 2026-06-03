-- Deploy: schemas/myapp_limits_public/tables/app_limit_caps/columns/name/alterations/alt0000000152
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_caps/table
-- requires: schemas/myapp_limits_public/tables/app_limit_caps/columns/name/column


ALTER TABLE myapp_limits_public.app_limit_caps 
  ALTER COLUMN name SET NOT NULL;

