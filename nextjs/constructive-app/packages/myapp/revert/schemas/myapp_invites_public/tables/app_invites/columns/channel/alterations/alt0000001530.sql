-- Revert: schemas/myapp_invites_public/tables/app_invites/columns/channel/alterations/alt0000001530


ALTER TABLE myapp_invites_public.app_invites 
  DROP CONSTRAINT app_invites_channel_email_phone_chk;


