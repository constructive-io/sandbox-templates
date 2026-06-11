-- Revert: schemas/myapp_limits_public/tables/org_limits/columns/id/column


ALTER TABLE myapp_limits_public.org_limits 
  DROP COLUMN id RESTRICT;


