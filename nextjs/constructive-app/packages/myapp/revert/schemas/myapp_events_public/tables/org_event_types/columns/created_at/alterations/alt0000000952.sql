-- Revert: schemas/myapp_events_public/tables/org_event_types/columns/created_at/alterations/alt0000000952


ALTER TABLE myapp_events_public.org_event_types 
  ALTER COLUMN created_at DROP DEFAULT;


