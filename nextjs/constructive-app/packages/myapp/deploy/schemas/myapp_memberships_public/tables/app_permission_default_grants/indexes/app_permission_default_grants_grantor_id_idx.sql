-- Deploy: schemas/myapp_memberships_public/tables/app_permission_default_grants/indexes/app_permission_default_grants_grantor_id_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/app_permission_default_grants/table
-- requires: schemas/myapp_memberships_public/tables/app_permission_default_grants/columns/grantor_id/column


CREATE INDEX app_permission_default_grants_grantor_id_idx ON myapp_memberships_public.app_permission_default_grants USING BTREE ( grantor_id );

