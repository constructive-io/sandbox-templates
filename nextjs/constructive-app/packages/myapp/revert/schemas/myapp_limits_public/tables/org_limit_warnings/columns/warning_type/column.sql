-- Revert: schemas/myapp_limits_public/tables/org_limit_warnings/columns/warning_type/column


ALTER TABLE myapp_limits_public.org_limit_warnings 
  DROP COLUMN warning_type RESTRICT;


