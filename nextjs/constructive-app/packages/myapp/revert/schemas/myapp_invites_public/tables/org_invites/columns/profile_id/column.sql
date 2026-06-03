-- Revert: schemas/myapp_invites_public/tables/org_invites/columns/profile_id/column


ALTER TABLE myapp_invites_public.org_invites 
  DROP COLUMN profile_id RESTRICT;


