-- Revert: schemas/myapp_memberships_public/tables/org_membership_defaults/columns/updated_at/alterations/alt0000000638


ALTER TABLE myapp_memberships_public.org_membership_defaults 
  ALTER COLUMN updated_at DROP DEFAULT;


