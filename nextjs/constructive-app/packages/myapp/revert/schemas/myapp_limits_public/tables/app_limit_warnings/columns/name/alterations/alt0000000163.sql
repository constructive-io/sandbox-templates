-- Revert: schemas/myapp_limits_public/tables/app_limit_warnings/columns/name/alterations/alt0000000163


ALTER TABLE myapp_limits_public.app_limit_warnings 
  ALTER COLUMN name DROP NOT NULL;


