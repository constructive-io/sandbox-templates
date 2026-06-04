-- Revert: schemas/myapp_memberships_public/tables/org_membership_settings/columns/created_at/alterations/alt0000000651


ALTER TABLE myapp_memberships_public.org_membership_settings 
  ALTER COLUMN created_at DROP DEFAULT;


