-- Revert: schemas/myapp_limits_public/tables/org_limits/columns/max/column


ALTER TABLE myapp_limits_public.org_limits 
  DROP COLUMN max RESTRICT;


