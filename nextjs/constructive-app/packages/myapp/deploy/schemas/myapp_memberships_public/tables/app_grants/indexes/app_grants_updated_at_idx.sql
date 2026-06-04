-- Deploy: schemas/myapp_memberships_public/tables/app_grants/indexes/app_grants_updated_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/app_grants/table
-- requires: schemas/myapp_memberships_public/tables/app_grants/columns/updated_at/column


CREATE INDEX app_grants_updated_at_idx ON myapp_memberships_public.app_grants ( updated_at );

