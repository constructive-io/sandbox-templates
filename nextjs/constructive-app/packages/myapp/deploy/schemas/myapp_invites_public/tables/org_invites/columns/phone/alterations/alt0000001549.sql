-- Deploy: schemas/myapp_invites_public/tables/org_invites/columns/phone/alterations/alt0000001549
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/org_invites/columns/phone/column


COMMENT ON COLUMN myapp_invites_public.org_invites.phone IS E'Phone number of the invited recipient in E.164 format (required when channel=sms)';

