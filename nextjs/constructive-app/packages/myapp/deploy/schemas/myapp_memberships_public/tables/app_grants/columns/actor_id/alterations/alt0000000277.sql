-- Deploy: schemas/myapp_memberships_public/tables/app_grants/columns/actor_id/alterations/alt0000000277
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/app_grants/columns/actor_id/column


COMMENT ON COLUMN myapp_memberships_public.app_grants.actor_id IS 'The member receiving or losing the permission grant';

