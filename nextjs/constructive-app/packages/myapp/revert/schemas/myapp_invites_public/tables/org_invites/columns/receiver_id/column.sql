-- Revert: schemas/myapp_invites_public/tables/org_invites/columns/receiver_id/column


ALTER TABLE myapp_invites_public.org_invites 
  DROP COLUMN receiver_id RESTRICT;


