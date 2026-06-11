-- Revert: schemas/myapp_limits_public/tables/org_limit_caps/columns/max/column


ALTER TABLE myapp_limits_public.org_limit_caps 
  DROP COLUMN max RESTRICT;


