-- Deploy: schemas/myapp_memberships_public/tables/org_memberships/columns/actor_id/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_memberships/table


ALTER TABLE myapp_memberships_public.org_memberships 
  ADD COLUMN actor_id uuid;

