-- Revert: schemas/myapp_limits_public/tables/org_limits/columns/window_start/column


ALTER TABLE myapp_limits_public.org_limits 
  DROP COLUMN window_start RESTRICT;


