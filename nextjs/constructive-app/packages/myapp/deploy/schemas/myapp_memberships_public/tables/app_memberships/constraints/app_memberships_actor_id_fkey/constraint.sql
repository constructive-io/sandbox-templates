-- Deploy: schemas/myapp_memberships_public/tables/app_memberships/constraints/app_memberships_actor_id_fkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_users_public/tables/users/table
-- requires: schemas/myapp_memberships_public/tables/app_memberships/table


ALTER TABLE myapp_memberships_public.app_memberships 
  ADD CONSTRAINT app_memberships_actor_id_fkey 
    FOREIGN KEY(actor_id) 
    REFERENCES myapp_users_public.users (id) 
    ON DELETE CASCADE;

