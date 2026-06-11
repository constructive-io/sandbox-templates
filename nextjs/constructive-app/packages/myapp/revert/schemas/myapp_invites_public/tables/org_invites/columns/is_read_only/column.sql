-- Revert: schemas/myapp_invites_public/tables/org_invites/columns/is_read_only/column


ALTER TABLE myapp_invites_public.org_invites 
  DROP COLUMN is_read_only RESTRICT;


