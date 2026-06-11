-- Revert: schemas/myapp_limits_public/tables/org_limit_warnings/columns/threshold_value/alterations/alt0000000611


ALTER TABLE myapp_limits_public.org_limit_warnings 
  ALTER COLUMN threshold_value DROP NOT NULL;


