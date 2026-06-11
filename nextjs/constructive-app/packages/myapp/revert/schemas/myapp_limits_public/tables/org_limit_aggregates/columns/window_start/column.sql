-- Revert: schemas/myapp_limits_public/tables/org_limit_aggregates/columns/window_start/column


ALTER TABLE myapp_limits_public.org_limit_aggregates 
  DROP COLUMN window_start RESTRICT;


