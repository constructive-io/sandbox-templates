-- Revert: schemas/myapp_invites_public/tables/org_invites/columns/updated_at/column


ALTER TABLE myapp_invites_public.org_invites 
  DROP COLUMN updated_at RESTRICT;


