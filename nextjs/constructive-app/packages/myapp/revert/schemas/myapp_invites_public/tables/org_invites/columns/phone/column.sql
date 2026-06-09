-- Revert: schemas/myapp_invites_public/tables/org_invites/columns/phone/column


ALTER TABLE myapp_invites_public.org_invites 
  DROP COLUMN phone RESTRICT;


