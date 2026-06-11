-- Revert: schemas/myapp_events_public/tables/org_events/constraints/org_events_actor_id_fkey/constraint


ALTER TABLE myapp_events_public.org_events 
  DROP CONSTRAINT org_events_actor_id_fkey;


