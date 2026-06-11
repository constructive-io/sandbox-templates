-- Revert: schemas/myapp_invites_public/tables/org_claimed_invites/columns/updated_at/alterations/alt0000001589


ALTER TABLE myapp_invites_public.org_claimed_invites 
  ALTER COLUMN updated_at DROP DEFAULT;


