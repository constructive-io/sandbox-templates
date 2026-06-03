-- Revert: schemas/myapp_invites_public/tables/org_invites/columns/data/column


ALTER TABLE myapp_invites_public.org_invites 
  DROP COLUMN data RESTRICT;


