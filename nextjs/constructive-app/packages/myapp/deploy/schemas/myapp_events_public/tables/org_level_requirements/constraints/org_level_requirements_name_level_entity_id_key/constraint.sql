-- Deploy: schemas/myapp_events_public/tables/org_level_requirements/constraints/org_level_requirements_name_level_entity_id_key/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_level_requirements/table


ALTER TABLE myapp_events_public.org_level_requirements 
  ADD CONSTRAINT org_level_requirements_name_level_entity_id_key 
    UNIQUE (name, level, entity_id);

