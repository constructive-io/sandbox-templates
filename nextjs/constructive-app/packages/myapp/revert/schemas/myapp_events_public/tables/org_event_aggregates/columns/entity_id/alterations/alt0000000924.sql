-- Revert: schemas/myapp_events_public/tables/org_event_aggregates/columns/entity_id/alterations/alt0000000924


ALTER TABLE myapp_events_public.org_event_aggregates 
  ALTER COLUMN entity_id DROP NOT NULL;


