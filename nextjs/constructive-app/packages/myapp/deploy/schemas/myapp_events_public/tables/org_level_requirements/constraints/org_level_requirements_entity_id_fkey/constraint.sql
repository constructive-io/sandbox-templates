-- Deploy: schemas/myapp_events_public/tables/org_level_requirements/constraints/org_level_requirements_entity_id_fkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_users_public/tables/users/table
-- requires: schemas/myapp_events_public/tables/org_level_requirements/table


ALTER TABLE myapp_events_public.org_level_requirements 
  ADD CONSTRAINT org_level_requirements_entity_id_fkey 
    FOREIGN KEY(entity_id) 
    REFERENCES myapp_users_public.users (id) 
    ON DELETE CASCADE;

