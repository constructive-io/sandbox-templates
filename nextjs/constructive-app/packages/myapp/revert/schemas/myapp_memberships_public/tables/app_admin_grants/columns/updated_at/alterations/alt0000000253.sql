-- Revert: schemas/myapp_memberships_public/tables/app_admin_grants/columns/updated_at/alterations/alt0000000253


ALTER TABLE myapp_memberships_public.app_admin_grants 
  ALTER COLUMN updated_at DROP DEFAULT;


