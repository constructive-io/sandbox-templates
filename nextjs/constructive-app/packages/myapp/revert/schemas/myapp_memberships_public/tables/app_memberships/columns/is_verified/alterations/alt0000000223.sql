-- Revert: schemas/myapp_memberships_public/tables/app_memberships/columns/is_verified/alterations/alt0000000223


ALTER TABLE myapp_memberships_public.app_memberships 
  ALTER COLUMN is_verified DROP DEFAULT;


