-- Revert: schemas/myapp_invites_public/tables/org_invites/columns/multiple/alterations/alt0000001567


ALTER TABLE myapp_invites_public.org_invites 
  ALTER COLUMN multiple DROP DEFAULT;


