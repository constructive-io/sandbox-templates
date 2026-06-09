-- Deploy: schemas/myapp_invites_public/tables/app_invites/columns/data/alterations/alt0000001523
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/app_invites/columns/data/column


COMMENT ON COLUMN myapp_invites_public.app_invites.data IS 'Optional JSON payload of additional invite metadata';

