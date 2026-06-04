-- Revert: schemas/myapp_limits_public/tables/org_limits/columns/name/column


ALTER TABLE myapp_limits_public.org_limits 
  DROP COLUMN name RESTRICT;


