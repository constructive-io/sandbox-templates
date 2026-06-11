-- Revert: schemas/myapp_events_public/tables/org_event_types/constraints/org_event_types_name_entity_id_key/constraint


ALTER TABLE myapp_events_public.org_event_types 
  DROP CONSTRAINT org_event_types_name_entity_id_key;


