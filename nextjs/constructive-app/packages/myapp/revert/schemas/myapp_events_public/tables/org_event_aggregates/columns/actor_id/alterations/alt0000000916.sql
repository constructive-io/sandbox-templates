-- Revert: schemas/myapp_events_public/tables/org_event_aggregates/columns/actor_id/alterations/alt0000000916


ALTER TABLE myapp_events_public.org_event_aggregates 
  ALTER COLUMN actor_id DROP NOT NULL;


