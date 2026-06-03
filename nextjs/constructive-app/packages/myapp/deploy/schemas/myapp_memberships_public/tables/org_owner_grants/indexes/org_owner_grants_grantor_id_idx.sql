-- Deploy: schemas/myapp_memberships_public/tables/org_owner_grants/indexes/org_owner_grants_grantor_id_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_owner_grants/table
-- requires: schemas/myapp_memberships_public/tables/org_owner_grants/columns/grantor_id/column


CREATE INDEX org_owner_grants_grantor_id_idx ON myapp_memberships_public.org_owner_grants USING BTREE ( grantor_id );

