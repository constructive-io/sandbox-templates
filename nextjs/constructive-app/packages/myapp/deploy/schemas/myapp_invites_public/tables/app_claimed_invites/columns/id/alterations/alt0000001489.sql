-- Deploy: schemas/myapp_invites_public/tables/app_claimed_invites/columns/id/alterations/alt0000001489
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/app_claimed_invites/table
-- requires: schemas/myapp_invites_public/tables/app_claimed_invites/columns/id/column


ALTER TABLE myapp_invites_public.app_claimed_invites 
  ALTER COLUMN id SET DEFAULT uuidv7();

