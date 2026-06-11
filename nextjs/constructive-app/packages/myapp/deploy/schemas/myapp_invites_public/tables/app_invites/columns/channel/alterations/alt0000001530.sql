-- Deploy: schemas/myapp_invites_public/tables/app_invites/columns/channel/alterations/alt0000001530
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/app_invites/table
-- requires: schemas/myapp_invites_public/tables/app_invites/columns/email/column
-- requires: schemas/myapp_invites_public/tables/app_invites/columns/phone/column
-- requires: schemas/myapp_invites_public/tables/app_invites/columns/channel/column


ALTER TABLE myapp_invites_public.app_invites 
  ADD CONSTRAINT app_invites_channel_email_phone_chk 
    CHECK (channel <> 'sms' OR phone IS NOT NULL);

