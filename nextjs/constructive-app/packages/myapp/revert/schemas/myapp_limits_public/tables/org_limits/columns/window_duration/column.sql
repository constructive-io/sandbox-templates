-- Revert: schemas/myapp_limits_public/tables/org_limits/columns/window_duration/column


ALTER TABLE myapp_limits_public.org_limits 
  DROP COLUMN window_duration RESTRICT;


