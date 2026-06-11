-- Revert: schemas/myapp_events_public/tables/app_events/constraints/app_events_pkey/constraint


ALTER TABLE myapp_events_public.app_events 
  DROP CONSTRAINT app_events_pkey;


