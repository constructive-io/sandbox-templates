-- Revert: schemas/myapp_memberships_public/tables/org_membership_defaults/columns/created_at/alterations/alt0000000622


ALTER TABLE myapp_memberships_public.org_membership_defaults 
  ALTER COLUMN created_at DROP DEFAULT;


