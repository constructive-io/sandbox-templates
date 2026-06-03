-- Revert: schemas/myapp_events_public/tables/org_event_types/columns/feeds_levels/alterations/alt0000000914


ALTER TABLE myapp_events_public.org_event_types 
  ALTER COLUMN feeds_levels DROP NOT NULL;


