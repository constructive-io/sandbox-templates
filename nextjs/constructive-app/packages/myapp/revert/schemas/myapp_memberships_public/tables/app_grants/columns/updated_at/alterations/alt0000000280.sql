-- Revert: schemas/myapp_memberships_public/tables/app_grants/columns/updated_at/alterations/alt0000000280


ALTER TABLE myapp_memberships_public.app_grants 
  ALTER COLUMN updated_at DROP DEFAULT;


