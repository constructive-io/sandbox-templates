-- Revert: schemas/myapp_memberships_public/tables/app_membership_defaults/columns/updated_at/alterations/alt0000000192


ALTER TABLE myapp_memberships_public.app_membership_defaults 
  ALTER COLUMN updated_at DROP DEFAULT;


