-- Deploy: schemas/myapp_invites_public/tables/app_claimed_invites/alterations/alt0000001486
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/app_claimed_invites/table


ALTER TABLE myapp_invites_public.app_claimed_invites 
  DISABLE ROW LEVEL SECURITY;

