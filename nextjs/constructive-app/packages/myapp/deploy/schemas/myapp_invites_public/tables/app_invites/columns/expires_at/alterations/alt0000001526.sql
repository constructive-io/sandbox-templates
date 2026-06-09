-- Deploy: schemas/myapp_invites_public/tables/app_invites/columns/expires_at/alterations/alt0000001526
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/app_invites/table
-- requires: schemas/myapp_invites_public/tables/app_invites/columns/expires_at/column


ALTER TABLE myapp_invites_public.app_invites 
  ALTER COLUMN expires_at SET DEFAULT now() + '6 months'::interval;

