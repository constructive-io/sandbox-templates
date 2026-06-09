-- Deploy: schemas/myapp_invites_public/tables/app_claimed_invites/columns/sender_id/alterations/alt0000001540
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/app_claimed_invites/table
-- requires: schemas/myapp_invites_public/tables/app_claimed_invites/columns/sender_id/column
-- requires: schemas/myapp_invites_public/tables/app_claimed_invites/columns/receiver_id/column


ALTER TABLE myapp_invites_public.app_claimed_invites 
  ADD CONSTRAINT app_claimed_invites_sender_id_receiver_id_chk 
    CHECK (sender_id <> receiver_id);

