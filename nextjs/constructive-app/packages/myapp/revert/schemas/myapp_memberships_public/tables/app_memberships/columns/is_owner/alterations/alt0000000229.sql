-- Revert: schemas/myapp_memberships_public/tables/app_memberships/columns/is_owner/alterations/alt0000000229


ALTER TABLE myapp_memberships_public.app_memberships 
  ALTER COLUMN is_owner DROP DEFAULT;


