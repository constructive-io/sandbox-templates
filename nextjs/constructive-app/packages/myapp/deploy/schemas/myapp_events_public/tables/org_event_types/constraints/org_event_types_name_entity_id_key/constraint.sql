-- Deploy: schemas/myapp_events_public/tables/org_event_types/constraints/org_event_types_name_entity_id_key/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_event_types/table


ALTER TABLE myapp_events_public.org_event_types 
  ADD CONSTRAINT org_event_types_name_entity_id_key 
    UNIQUE (name, entity_id);

