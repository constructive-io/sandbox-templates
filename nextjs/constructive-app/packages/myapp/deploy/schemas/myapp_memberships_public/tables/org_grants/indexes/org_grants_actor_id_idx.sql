-- Deploy: schemas/myapp_memberships_public/tables/org_grants/indexes/org_grants_actor_id_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_grants/table
-- requires: schemas/myapp_memberships_public/tables/org_grants/columns/actor_id/column


CREATE INDEX org_grants_actor_id_idx ON myapp_memberships_public.org_grants USING BTREE ( actor_id );

