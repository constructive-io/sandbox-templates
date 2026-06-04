-- Revert: schemas/myapp_invites_public/tables/app_claimed_invites/constraints/app_claimed_invites_sender_id_fkey/constraint


ALTER TABLE myapp_invites_public.app_claimed_invites 
  DROP CONSTRAINT app_claimed_invites_sender_id_fkey;


