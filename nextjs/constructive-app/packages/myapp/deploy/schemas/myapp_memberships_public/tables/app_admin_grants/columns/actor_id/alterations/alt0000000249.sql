-- Deploy: schemas/myapp_memberships_public/tables/app_admin_grants/columns/actor_id/alterations/alt0000000249
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/app_admin_grants/table
-- requires: schemas/myapp_memberships_public/tables/app_admin_grants/columns/actor_id/column


ALTER TABLE myapp_memberships_public.app_admin_grants 
  ALTER COLUMN actor_id SET NOT NULL;

