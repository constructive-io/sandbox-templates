-- Revert: schemas/myapp_memberships_public/tables/app_memberships/columns/is_admin/alterations/alt0000000232


ALTER TABLE myapp_memberships_public.app_memberships 
  ALTER COLUMN is_admin DROP DEFAULT;


