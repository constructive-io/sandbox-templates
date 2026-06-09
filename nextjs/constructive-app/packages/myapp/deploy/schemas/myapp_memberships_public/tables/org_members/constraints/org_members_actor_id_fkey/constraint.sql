-- Deploy: schemas/myapp_memberships_public/tables/org_members/constraints/org_members_actor_id_fkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_users_public/schema
-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_users_public/tables/users/table
-- requires: schemas/myapp_memberships_public/tables/org_members/table


ALTER TABLE myapp_memberships_public.org_members 
  ADD CONSTRAINT org_members_actor_id_fkey 
    FOREIGN KEY(actor_id) 
    REFERENCES myapp_users_public.users (id) 
    ON DELETE CASCADE;

