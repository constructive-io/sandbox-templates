-- Revert: schemas/myapp_memberships_public/tables/app_membership_defaults/columns/id/alterations/alt0000000190


ALTER TABLE myapp_memberships_public.app_membership_defaults 
  ALTER COLUMN id DROP DEFAULT;


