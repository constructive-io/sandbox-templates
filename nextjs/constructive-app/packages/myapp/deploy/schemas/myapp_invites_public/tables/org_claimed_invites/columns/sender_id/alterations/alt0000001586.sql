-- Deploy: schemas/myapp_invites_public/tables/org_claimed_invites/columns/sender_id/alterations/alt0000001586
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/org_claimed_invites/columns/sender_id/column


COMMENT ON COLUMN myapp_invites_public.org_claimed_invites.sender_id IS 'User ID of the original invitation sender';

