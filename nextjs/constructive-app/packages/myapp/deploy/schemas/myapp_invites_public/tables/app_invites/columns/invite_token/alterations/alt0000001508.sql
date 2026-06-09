-- Deploy: schemas/myapp_invites_public/tables/app_invites/columns/invite_token/alterations/alt0000001508
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/app_invites/table
-- requires: schemas/myapp_invites_public/tables/app_invites/columns/invite_token/column


ALTER TABLE myapp_invites_public.app_invites 
  ALTER COLUMN invite_token SET NOT NULL;

