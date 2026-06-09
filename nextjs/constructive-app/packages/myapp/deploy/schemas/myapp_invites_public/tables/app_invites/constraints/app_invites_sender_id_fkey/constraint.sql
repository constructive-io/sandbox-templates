-- Deploy: schemas/myapp_invites_public/tables/app_invites/constraints/app_invites_sender_id_fkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_users_public/schema
-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_users_public/tables/users/table
-- requires: schemas/myapp_invites_public/tables/app_invites/table


ALTER TABLE myapp_invites_public.app_invites 
  ADD CONSTRAINT app_invites_sender_id_fkey 
    FOREIGN KEY(sender_id) 
    REFERENCES myapp_users_public.users (id) 
    ON DELETE CASCADE;

