-- Revert: schemas/myapp_limits_public/tables/app_limit_warnings/columns/threshold_value/alterations/alt0000000167


ALTER TABLE myapp_limits_public.app_limit_warnings 
  ALTER COLUMN threshold_value DROP NOT NULL;


