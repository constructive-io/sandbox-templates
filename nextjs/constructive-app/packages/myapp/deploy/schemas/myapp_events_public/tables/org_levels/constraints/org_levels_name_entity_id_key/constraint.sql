-- Deploy: schemas/myapp_events_public/tables/org_levels/constraints/org_levels_name_entity_id_key/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_levels/table


ALTER TABLE myapp_events_public.org_levels 
  ADD CONSTRAINT org_levels_name_entity_id_key 
    UNIQUE (name, entity_id);

