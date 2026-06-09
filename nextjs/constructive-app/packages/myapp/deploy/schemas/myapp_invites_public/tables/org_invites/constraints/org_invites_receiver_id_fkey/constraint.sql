-- Deploy: schemas/myapp_invites_public/tables/org_invites/constraints/org_invites_receiver_id_fkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_users_public/schema
-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_users_public/tables/users/table
-- requires: schemas/myapp_invites_public/tables/org_invites/table


ALTER TABLE myapp_invites_public.org_invites 
  ADD CONSTRAINT org_invites_receiver_id_fkey 
    FOREIGN KEY(receiver_id) 
    REFERENCES myapp_users_public.users (id) 
    ON DELETE CASCADE;

