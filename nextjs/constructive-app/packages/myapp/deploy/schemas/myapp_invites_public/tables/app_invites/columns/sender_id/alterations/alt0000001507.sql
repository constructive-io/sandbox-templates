-- Deploy: schemas/myapp_invites_public/tables/app_invites/columns/sender_id/alterations/alt0000001507
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/app_invites/columns/sender_id/column


COMMENT ON COLUMN myapp_invites_public.app_invites.sender_id IS 'User ID of the member who sent this invitation';

