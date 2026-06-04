-- Revert: schemas/myapp_invites_public/tables/app_claimed_invites/columns/data/column


ALTER TABLE myapp_invites_public.app_claimed_invites 
  DROP COLUMN data RESTRICT;


