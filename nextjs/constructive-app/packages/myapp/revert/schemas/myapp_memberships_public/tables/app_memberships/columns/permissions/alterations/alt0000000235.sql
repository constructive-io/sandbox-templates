-- Revert: schemas/myapp_memberships_public/tables/app_memberships/columns/permissions/alterations/alt0000000235


ALTER TABLE myapp_memberships_public.app_memberships 
  ALTER COLUMN permissions DROP DEFAULT;


