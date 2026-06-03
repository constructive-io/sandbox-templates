-- Revert: schemas/myapp_limits_public/tables/app_limit_warnings/columns/warning_type/alterations/alt0000000165


ALTER TABLE myapp_limits_public.app_limit_warnings 
  ALTER COLUMN warning_type DROP NOT NULL;


