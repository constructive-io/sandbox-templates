-- Revert: schemas/myapp_limits_public/tables/app_limit_events/columns/max_at_event/column


ALTER TABLE myapp_limits_public.app_limit_events 
  DROP COLUMN max_at_event RESTRICT;


