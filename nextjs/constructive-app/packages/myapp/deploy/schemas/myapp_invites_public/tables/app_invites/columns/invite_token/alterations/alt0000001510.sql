-- Deploy: schemas/myapp_invites_public/tables/app_invites/columns/invite_token/alterations/alt0000001510
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/app_invites/columns/invite_token/column


COMMENT ON COLUMN myapp_invites_public.app_invites.invite_token IS 'Unique random hex token used to redeem this invitation';

