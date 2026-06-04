-- Revert: schemas/myapp_limits_public/tables/org_limit_warnings/columns/threshold_value/column


ALTER TABLE myapp_limits_public.org_limit_warnings 
  DROP COLUMN threshold_value RESTRICT;


