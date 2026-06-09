-- Revert: schemas/myapp_events_public/tables/org_events/columns/entity_id/alterations/alt0000000909


ALTER TABLE myapp_events_public.org_events 
  ALTER COLUMN entity_id DROP NOT NULL;


