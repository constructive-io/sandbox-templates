-- Deploy: schemas/myapp_invites_public/tables/app_invites/columns/invite_count/alterations/alt0000001475
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/app_invites/columns/invite_count/column


COMMENT ON COLUMN myapp_invites_public.app_invites.invite_count IS 'Running count of how many times this invite has been claimed';

