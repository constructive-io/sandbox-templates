-- Deploy: schemas/myapp_invites_public/tables/org_invites/columns/is_read_only/alterations/alt0000001524
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/org_invites/columns/is_read_only/column


COMMENT ON COLUMN myapp_invites_public.org_invites.is_read_only IS E'Whether the resulting membership should be read-only when this invite is claimed';

