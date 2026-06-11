-- Revert: schemas/myapp_invites_public/tables/org_invites/columns/multiple/column


ALTER TABLE myapp_invites_public.org_invites 
  DROP COLUMN multiple RESTRICT;


