-- Revert: schemas/myapp_limits_public/tables/app_limit_warnings/columns/id/alterations/alt0000000162


ALTER TABLE myapp_limits_public.app_limit_warnings 
  ALTER COLUMN id DROP DEFAULT;


