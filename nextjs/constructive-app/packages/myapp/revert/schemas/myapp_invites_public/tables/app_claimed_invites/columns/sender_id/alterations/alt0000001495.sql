-- Revert: schemas/myapp_invites_public/tables/app_claimed_invites/columns/sender_id/alterations/alt0000001495


ALTER TABLE myapp_invites_public.app_claimed_invites 
  DROP CONSTRAINT app_claimed_invites_sender_id_receiver_id_chk;


