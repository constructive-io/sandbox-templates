-- Deploy: schemas/myapp_invites_public/tables/app_claimed_invites/columns/data/alterations/alt0000001535
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/app_claimed_invites/columns/data/column


COMMENT ON COLUMN myapp_invites_public.app_claimed_invites.data IS 'Optional JSON payload captured at the time the invite was claimed';

