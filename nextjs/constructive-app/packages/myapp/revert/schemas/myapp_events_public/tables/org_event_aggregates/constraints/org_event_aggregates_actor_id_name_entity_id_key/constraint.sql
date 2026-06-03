-- Revert: schemas/myapp_events_public/tables/org_event_aggregates/constraints/org_event_aggregates_actor_id_name_entity_id_key/constraint


ALTER TABLE myapp_events_public.org_event_aggregates 
  DROP CONSTRAINT org_event_aggregates_actor_id_name_entity_id_key;


