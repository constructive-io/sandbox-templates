-- Deploy: schemas/myapp_limits_public/tables/app_limit_defaults/columns/name/alterations/alt0000000072
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_defaults/table
-- requires: schemas/myapp_limits_public/tables/app_limit_defaults/columns/name/column


ALTER TABLE myapp_limits_public.app_limit_defaults 
  ALTER COLUMN name SET NOT NULL;

