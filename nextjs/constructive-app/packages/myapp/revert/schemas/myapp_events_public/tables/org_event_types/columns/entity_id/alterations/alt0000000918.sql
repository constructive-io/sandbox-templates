-- Revert: schemas/myapp_events_public/tables/org_event_types/columns/entity_id/alterations/alt0000000918


ALTER TABLE myapp_events_public.org_event_types 
  ALTER COLUMN entity_id DROP NOT NULL;


