-- Revert: schemas/myapp_limits_public/tables/app_limit_events/columns/event_type/column


ALTER TABLE myapp_limits_public.app_limit_events 
  DROP COLUMN event_type RESTRICT;


