-- Revert: schemas/myapp_events_public/tables/app_event_aggregates/constraints/app_event_aggregates_pkey/constraint


ALTER TABLE myapp_events_public.app_event_aggregates 
  DROP CONSTRAINT app_event_aggregates_pkey;


