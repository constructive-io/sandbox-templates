-- Revert: schemas/myapp_memberships_public/tables/app_admin_grants/columns/created_at/alterations/alt0000000251


ALTER TABLE myapp_memberships_public.app_admin_grants 
  ALTER COLUMN created_at DROP DEFAULT;


