-- Revert: schemas/myapp_invites_public/tables/org_invites/columns/created_at/column


ALTER TABLE myapp_invites_public.org_invites 
  DROP COLUMN created_at RESTRICT;


