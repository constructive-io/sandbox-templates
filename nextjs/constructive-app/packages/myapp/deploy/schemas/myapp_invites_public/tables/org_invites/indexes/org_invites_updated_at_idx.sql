-- Deploy: schemas/myapp_invites_public/tables/org_invites/indexes/org_invites_updated_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/org_invites/table
-- requires: schemas/myapp_invites_public/tables/org_invites/columns/updated_at/column


CREATE INDEX org_invites_updated_at_idx ON myapp_invites_public.org_invites ( updated_at );

