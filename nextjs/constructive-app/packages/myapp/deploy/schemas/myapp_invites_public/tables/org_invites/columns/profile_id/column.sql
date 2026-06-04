-- Deploy: schemas/myapp_invites_public/tables/org_invites/columns/profile_id/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/org_invites/table


ALTER TABLE myapp_invites_public.org_invites 
  ADD COLUMN profile_id uuid;

