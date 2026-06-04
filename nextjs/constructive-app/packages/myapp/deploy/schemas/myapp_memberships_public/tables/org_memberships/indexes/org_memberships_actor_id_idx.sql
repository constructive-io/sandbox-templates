-- Deploy: schemas/myapp_memberships_public/tables/org_memberships/indexes/org_memberships_actor_id_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_memberships/table
-- requires: schemas/myapp_memberships_public/tables/org_memberships/columns/actor_id/column


CREATE INDEX org_memberships_actor_id_idx ON myapp_memberships_public.org_memberships USING BTREE ( actor_id );

