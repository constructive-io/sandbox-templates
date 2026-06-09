-- Deploy: schemas/myapp_invites_public/tables/org_claimed_invites/columns/receiver_id/alterations/alt0000001587
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/org_claimed_invites/columns/receiver_id/column


COMMENT ON COLUMN myapp_invites_public.org_claimed_invites.receiver_id IS 'User ID of the person who claimed and redeemed the invitation';

