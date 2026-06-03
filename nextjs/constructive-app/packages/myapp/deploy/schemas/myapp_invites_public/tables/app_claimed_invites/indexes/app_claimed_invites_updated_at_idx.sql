-- Deploy: schemas/myapp_invites_public/tables/app_claimed_invites/indexes/app_claimed_invites_updated_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/app_claimed_invites/table
-- requires: schemas/myapp_invites_public/tables/app_claimed_invites/columns/updated_at/column


CREATE INDEX app_claimed_invites_updated_at_idx ON myapp_invites_public.app_claimed_invites ( updated_at );

