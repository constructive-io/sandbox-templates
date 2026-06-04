-- Revert: schemas/myapp_invites_public/tables/org_invites/columns/sender_id/column


ALTER TABLE myapp_invites_public.org_invites 
  DROP COLUMN sender_id RESTRICT;


