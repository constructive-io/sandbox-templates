-- Deploy: schemas/myapp_invites_public/tables/org_invites/indexes/org_invites_sender_id_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/org_invites/table
-- requires: schemas/myapp_invites_public/tables/org_invites/columns/sender_id/column


CREATE INDEX org_invites_sender_id_idx ON myapp_invites_public.org_invites USING BTREE ( sender_id );

