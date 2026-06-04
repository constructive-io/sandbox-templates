-- Deploy: schemas/myapp_invites_public/tables/org_invites/columns/multiple/alterations/alt0000001519
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/org_invites/columns/multiple/column


COMMENT ON COLUMN myapp_invites_public.org_invites.multiple IS 'Whether this invite can be claimed by multiple recipients';

