-- Deploy: schemas/myapp_events_public/tables/org_levels/constraints/org_levels_entity_id_fkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_users_public/tables/users/table
-- requires: schemas/myapp_events_public/tables/org_levels/table


ALTER TABLE myapp_events_public.org_levels 
  ADD CONSTRAINT org_levels_entity_id_fkey 
    FOREIGN KEY(entity_id) 
    REFERENCES myapp_users_public.users (id) 
    ON DELETE CASCADE;

