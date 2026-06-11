-- Revert: schemas/myapp_events_public/tables/org_events/columns/actor_id/column


ALTER TABLE myapp_events_public.org_events 
  DROP COLUMN actor_id RESTRICT;


