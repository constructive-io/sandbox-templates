-- Deploy: schemas/myapp_invites_public/tables/app_invites/indexes/app_invites_updated_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/app_invites/table
-- requires: schemas/myapp_invites_public/tables/app_invites/columns/updated_at/column


CREATE INDEX app_invites_updated_at_idx ON myapp_invites_public.app_invites ( updated_at );

