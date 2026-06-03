-- Revert: schemas/myapp_limits_public/tables/org_limit_caps/columns/name/column


ALTER TABLE myapp_limits_public.org_limit_caps 
  DROP COLUMN name RESTRICT;


