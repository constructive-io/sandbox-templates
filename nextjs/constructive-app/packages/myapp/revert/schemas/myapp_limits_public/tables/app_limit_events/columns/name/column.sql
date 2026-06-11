-- Revert: schemas/myapp_limits_public/tables/app_limit_events/columns/name/column


ALTER TABLE myapp_limits_public.app_limit_events 
  DROP COLUMN name RESTRICT;


