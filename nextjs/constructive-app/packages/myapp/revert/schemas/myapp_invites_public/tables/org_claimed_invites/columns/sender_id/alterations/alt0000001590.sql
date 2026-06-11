-- Revert: schemas/myapp_invites_public/tables/org_claimed_invites/columns/sender_id/alterations/alt0000001590


ALTER TABLE myapp_invites_public.org_claimed_invites 
  DROP CONSTRAINT org_claimed_invites_sender_id_receiver_id_chk;


