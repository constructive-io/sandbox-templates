-- Deploy: schemas/myapp_invites_public/tables/app_invites/alterations/alt0000001456
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/app_invites/table


ALTER TABLE myapp_invites_public.app_invites 
  DISABLE ROW LEVEL SECURITY;

