-- Revert: schemas/myapp_memberships_public/tables/app_owner_grants/columns/updated_at/alterations/alt0000000265


ALTER TABLE myapp_memberships_public.app_owner_grants 
  ALTER COLUMN updated_at DROP DEFAULT;


