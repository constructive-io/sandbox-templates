-- Deploy: schemas/myapp_events_public/tables/app_levels/constraints/app_levels_owner_id_fkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_users_public/tables/users/table
-- requires: schemas/myapp_events_public/tables/app_levels/table


ALTER TABLE myapp_events_public.app_levels 
  ADD CONSTRAINT app_levels_owner_id_fkey 
    FOREIGN KEY(owner_id) 
    REFERENCES myapp_users_public.users (id) 
    ON DELETE SET NULL;

