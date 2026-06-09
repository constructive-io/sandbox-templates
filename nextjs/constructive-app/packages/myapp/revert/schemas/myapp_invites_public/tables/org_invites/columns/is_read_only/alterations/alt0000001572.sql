-- Revert: schemas/myapp_invites_public/tables/org_invites/columns/is_read_only/alterations/alt0000001572


ALTER TABLE myapp_invites_public.org_invites 
  ALTER COLUMN is_read_only DROP DEFAULT;


