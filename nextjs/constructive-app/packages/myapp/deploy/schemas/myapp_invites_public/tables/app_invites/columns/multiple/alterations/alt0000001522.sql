-- Deploy: schemas/myapp_invites_public/tables/app_invites/columns/multiple/alterations/alt0000001522
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/app_invites/columns/multiple/column


COMMENT ON COLUMN myapp_invites_public.app_invites.multiple IS 'Whether this invite can be claimed by multiple recipients';

