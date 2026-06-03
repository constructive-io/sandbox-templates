-- Deploy: schemas/myapp_invites_public/tables/org_invites/columns/expires_at/alterations/alt0000001527
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/org_invites/columns/expires_at/column


COMMENT ON COLUMN myapp_invites_public.org_invites.expires_at IS 'Timestamp after which this invitation can no longer be redeemed';

