-- Deploy: schemas/myapp_invites_public/tables/org_invites/columns/channel/alterations/alt0000001547
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/org_invites/columns/channel/column


COMMENT ON COLUMN myapp_invites_public.org_invites.channel IS E'Delivery channel for this invitation: email, sms, or link';

