-- Deploy: schemas/myapp_memberships_public/tables/app_grants/constraints/app_grants_actor_id_fkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_users_public/schema
-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_users_public/tables/users/table
-- requires: schemas/myapp_memberships_public/tables/app_grants/table


ALTER TABLE myapp_memberships_public.app_grants 
  ADD CONSTRAINT app_grants_actor_id_fkey 
    FOREIGN KEY(actor_id) 
    REFERENCES myapp_users_public.users (id) 
    ON DELETE SET NULL;

