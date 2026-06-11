-- Revert: schemas/myapp_events_public/tables/org_level_grants/constraints/org_level_grants_entity_id_fkey/constraint


ALTER TABLE myapp_events_public.org_level_grants 
  DROP CONSTRAINT org_level_grants_entity_id_fkey;


