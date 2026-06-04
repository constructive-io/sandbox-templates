-- Deploy: schemas/myapp_invites_public/tables/org_invites/columns/receiver_id/alterations/alt0000001504
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/org_invites/columns/receiver_id/column


COMMENT ON COLUMN myapp_invites_public.org_invites.receiver_id IS E'User ID of the intended recipient, if targeting a specific user';

