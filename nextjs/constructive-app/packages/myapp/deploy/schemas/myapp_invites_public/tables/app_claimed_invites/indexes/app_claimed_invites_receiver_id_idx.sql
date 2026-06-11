-- Deploy: schemas/myapp_invites_public/tables/app_claimed_invites/indexes/app_claimed_invites_receiver_id_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/app_claimed_invites/table
-- requires: schemas/myapp_invites_public/tables/app_claimed_invites/columns/receiver_id/column


CREATE INDEX app_claimed_invites_receiver_id_idx ON myapp_invites_public.app_claimed_invites USING BTREE ( receiver_id );

