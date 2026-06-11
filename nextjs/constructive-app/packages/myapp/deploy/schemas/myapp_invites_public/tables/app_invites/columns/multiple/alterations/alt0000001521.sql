-- Deploy: schemas/myapp_invites_public/tables/app_invites/columns/multiple/alterations/alt0000001521
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/app_invites/table
-- requires: schemas/myapp_invites_public/tables/app_invites/columns/multiple/column


ALTER TABLE myapp_invites_public.app_invites 
  ALTER COLUMN multiple SET DEFAULT false;

