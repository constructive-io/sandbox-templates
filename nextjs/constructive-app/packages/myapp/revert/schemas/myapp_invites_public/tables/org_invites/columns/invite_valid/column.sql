-- Revert: schemas/myapp_invites_public/tables/org_invites/columns/invite_valid/column


ALTER TABLE myapp_invites_public.org_invites 
  DROP COLUMN invite_valid RESTRICT;


