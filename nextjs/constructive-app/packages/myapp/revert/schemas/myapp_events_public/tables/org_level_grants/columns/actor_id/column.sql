-- Revert: schemas/myapp_events_public/tables/org_level_grants/columns/actor_id/column


ALTER TABLE myapp_events_public.org_level_grants 
  DROP COLUMN actor_id RESTRICT;


