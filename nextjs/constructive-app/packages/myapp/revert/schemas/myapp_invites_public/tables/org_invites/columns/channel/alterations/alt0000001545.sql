-- Revert: schemas/myapp_invites_public/tables/org_invites/columns/channel/alterations/alt0000001545


ALTER TABLE myapp_invites_public.org_invites 
  ALTER COLUMN channel DROP NOT NULL;


