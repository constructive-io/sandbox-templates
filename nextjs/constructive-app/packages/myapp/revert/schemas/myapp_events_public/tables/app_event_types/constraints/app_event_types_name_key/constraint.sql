-- Revert: schemas/myapp_events_public/tables/app_event_types/constraints/app_event_types_name_key/constraint


ALTER TABLE myapp_events_public.app_event_types 
  DROP CONSTRAINT app_event_types_name_key;


