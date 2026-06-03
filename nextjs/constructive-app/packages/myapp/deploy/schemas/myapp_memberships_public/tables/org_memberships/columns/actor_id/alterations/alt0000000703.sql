-- Deploy: schemas/myapp_memberships_public/tables/org_memberships/columns/actor_id/alterations/alt0000000703
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_memberships/table
-- requires: schemas/myapp_memberships_public/tables/org_memberships/columns/actor_id/column


ALTER TABLE myapp_memberships_public.org_memberships 
  ALTER COLUMN actor_id SET NOT NULL;

