-- Deploy: schemas/myapp_limits_public/tables/app_limit_warnings/columns/warning_type/alterations/alt0000000165
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_warnings/table
-- requires: schemas/myapp_limits_public/tables/app_limit_warnings/columns/warning_type/column


ALTER TABLE myapp_limits_public.app_limit_warnings 
  ALTER COLUMN warning_type SET NOT NULL;

