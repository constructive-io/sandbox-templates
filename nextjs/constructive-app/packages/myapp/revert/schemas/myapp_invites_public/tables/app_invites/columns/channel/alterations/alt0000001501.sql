-- Revert: schemas/myapp_invites_public/tables/app_invites/columns/channel/alterations/alt0000001501


ALTER TABLE myapp_invites_public.app_invites 
  ALTER COLUMN channel DROP DEFAULT;


