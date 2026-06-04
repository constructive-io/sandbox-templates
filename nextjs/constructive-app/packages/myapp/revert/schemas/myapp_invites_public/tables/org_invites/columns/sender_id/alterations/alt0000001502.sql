-- Revert: schemas/myapp_invites_public/tables/org_invites/columns/sender_id/alterations/alt0000001502


ALTER TABLE myapp_invites_public.org_invites 
  ALTER COLUMN sender_id DROP DEFAULT;


