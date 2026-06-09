-- Revert: schemas/myapp_events_public/tables/org_level_grants/columns/actor_id/alterations/alt0000000989


ALTER TABLE myapp_events_public.org_level_grants 
  ALTER COLUMN actor_id DROP DEFAULT;


