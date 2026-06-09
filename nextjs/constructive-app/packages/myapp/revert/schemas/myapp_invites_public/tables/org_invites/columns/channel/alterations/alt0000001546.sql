-- Revert: schemas/myapp_invites_public/tables/org_invites/columns/channel/alterations/alt0000001546


ALTER TABLE myapp_invites_public.org_invites 
  ALTER COLUMN channel DROP DEFAULT;


