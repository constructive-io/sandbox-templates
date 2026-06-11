-- Deploy: schemas/myapp_invites_public/tables/app_invites/columns/created_at/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/app_invites/table


ALTER TABLE myapp_invites_public.app_invites 
  ADD COLUMN created_at timestamptz;

