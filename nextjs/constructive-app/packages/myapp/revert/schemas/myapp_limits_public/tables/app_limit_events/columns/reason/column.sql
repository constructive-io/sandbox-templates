-- Revert: schemas/myapp_limits_public/tables/app_limit_events/columns/reason/column


ALTER TABLE myapp_limits_public.app_limit_events 
  DROP COLUMN reason RESTRICT;


