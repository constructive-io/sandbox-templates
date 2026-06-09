-- Deploy: schemas/myapp_invites_public/tables/app_invites/columns/id/alterations/alt0000001498
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/app_invites/table
-- requires: schemas/myapp_invites_public/tables/app_invites/columns/id/column


ALTER TABLE myapp_invites_public.app_invites 
  ALTER COLUMN id SET NOT NULL;

