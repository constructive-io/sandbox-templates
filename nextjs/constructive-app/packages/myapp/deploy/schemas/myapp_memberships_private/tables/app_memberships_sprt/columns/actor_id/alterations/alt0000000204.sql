-- Deploy: schemas/myapp_memberships_private/tables/app_memberships_sprt/columns/actor_id/alterations/alt0000000204
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_private/schema
-- requires: schemas/myapp_memberships_private/tables/app_memberships_sprt/table
-- requires: schemas/myapp_memberships_private/tables/app_memberships_sprt/columns/actor_id/column


ALTER TABLE myapp_memberships_private.app_memberships_sprt 
  ALTER COLUMN actor_id SET NOT NULL;

