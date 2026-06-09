-- Revert: schemas/myapp_invites_public/tables/org_invites/columns/channel/alterations/alt0000001580


ALTER TABLE myapp_invites_public.org_invites 
  DROP CONSTRAINT org_invites_channel_email_phone_chk;


