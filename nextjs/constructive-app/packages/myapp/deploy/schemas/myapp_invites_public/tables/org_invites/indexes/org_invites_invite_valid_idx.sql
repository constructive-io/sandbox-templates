-- Deploy: schemas/myapp_invites_public/tables/org_invites/indexes/org_invites_invite_valid_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/org_invites/table
-- requires: schemas/myapp_invites_public/tables/org_invites/columns/invite_valid/column


CREATE INDEX org_invites_invite_valid_idx ON myapp_invites_public.org_invites USING BTREE ( invite_valid );

