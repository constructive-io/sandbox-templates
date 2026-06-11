-- Revert: schemas/myapp_limits_public/tables/app_limits/columns/window_duration/column


ALTER TABLE myapp_limits_public.app_limits 
  DROP COLUMN window_duration RESTRICT;


