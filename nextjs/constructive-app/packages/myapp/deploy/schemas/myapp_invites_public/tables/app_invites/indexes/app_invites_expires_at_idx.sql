-- Deploy: schemas/myapp_invites_public/tables/app_invites/indexes/app_invites_expires_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/app_invites/table
-- requires: schemas/myapp_invites_public/tables/app_invites/columns/expires_at/column


CREATE INDEX app_invites_expires_at_idx ON myapp_invites_public.app_invites USING BTREE ( expires_at );

