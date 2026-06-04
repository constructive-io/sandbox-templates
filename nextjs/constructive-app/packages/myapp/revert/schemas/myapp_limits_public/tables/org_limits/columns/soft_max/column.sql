-- Revert: schemas/myapp_limits_public/tables/org_limits/columns/soft_max/column


ALTER TABLE myapp_limits_public.org_limits 
  DROP COLUMN soft_max RESTRICT;


