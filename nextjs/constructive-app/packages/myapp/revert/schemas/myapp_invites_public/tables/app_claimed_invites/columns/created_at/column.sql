-- Revert: schemas/myapp_invites_public/tables/app_claimed_invites/columns/created_at/column


ALTER TABLE myapp_invites_public.app_claimed_invites 
  DROP COLUMN created_at RESTRICT;


