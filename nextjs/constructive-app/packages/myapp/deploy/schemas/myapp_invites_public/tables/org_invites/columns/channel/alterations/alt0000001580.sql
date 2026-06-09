-- Deploy: schemas/myapp_invites_public/tables/org_invites/columns/channel/alterations/alt0000001580
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/org_invites/table
-- requires: schemas/myapp_invites_public/tables/org_invites/columns/email/column
-- requires: schemas/myapp_invites_public/tables/org_invites/columns/phone/column
-- requires: schemas/myapp_invites_public/tables/org_invites/columns/channel/column


ALTER TABLE myapp_invites_public.org_invites 
  ADD CONSTRAINT org_invites_channel_email_phone_chk 
    CHECK (channel <> 'sms' OR phone IS NOT NULL);

