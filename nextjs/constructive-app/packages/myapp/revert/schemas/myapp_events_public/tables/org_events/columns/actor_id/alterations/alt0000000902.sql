-- Revert: schemas/myapp_events_public/tables/org_events/columns/actor_id/alterations/alt0000000902


ALTER TABLE myapp_events_public.org_events 
  ALTER COLUMN actor_id DROP NOT NULL;


