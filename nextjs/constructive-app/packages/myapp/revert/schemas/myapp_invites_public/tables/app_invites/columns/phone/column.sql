-- Revert: schemas/myapp_invites_public/tables/app_invites/columns/phone/column


ALTER TABLE myapp_invites_public.app_invites 
  DROP COLUMN phone RESTRICT;


