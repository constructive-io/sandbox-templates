-- Deploy: schemas/myapp_invites_public/tables/app_invites/constraints/app_invites_email_sender_id_key/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/app_invites/table


ALTER TABLE myapp_invites_public.app_invites 
  ADD CONSTRAINT app_invites_email_sender_id_key 
    UNIQUE (email, sender_id);

