-- Deploy: schemas/myapp_invites_public/tables/org_invites/columns/is_read_only/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/org_invites/table


ALTER TABLE myapp_invites_public.org_invites 
  ADD COLUMN is_read_only boolean;

