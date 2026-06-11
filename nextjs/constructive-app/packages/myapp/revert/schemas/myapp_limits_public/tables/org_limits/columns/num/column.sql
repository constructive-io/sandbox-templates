-- Revert: schemas/myapp_limits_public/tables/org_limits/columns/num/column


ALTER TABLE myapp_limits_public.org_limits 
  DROP COLUMN num RESTRICT;


