-- Revert: schemas/myapp_invites_public/tables/app_invites/columns/multiple/alterations/alt0000001520


ALTER TABLE myapp_invites_public.app_invites 
  ALTER COLUMN multiple DROP NOT NULL;


