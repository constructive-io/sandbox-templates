-- Revert: schemas/myapp_events_public/tables/org_levels/constraints/org_levels_name_entity_id_key/constraint


ALTER TABLE myapp_events_public.org_levels 
  DROP CONSTRAINT org_levels_name_entity_id_key;


