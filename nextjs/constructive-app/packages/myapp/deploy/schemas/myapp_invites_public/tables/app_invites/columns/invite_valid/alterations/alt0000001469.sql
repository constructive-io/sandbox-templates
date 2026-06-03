-- Deploy: schemas/myapp_invites_public/tables/app_invites/columns/invite_valid/alterations/alt0000001469
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/app_invites/columns/invite_valid/column


COMMENT ON COLUMN myapp_invites_public.app_invites.invite_valid IS 'Whether this invitation is still valid and can be redeemed';

