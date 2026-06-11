-- Revert: schemas/myapp_memberships_public/tables/app_admin_grants/columns/is_grant/alterations/alt0000000246


ALTER TABLE myapp_memberships_public.app_admin_grants 
  ALTER COLUMN is_grant DROP NOT NULL;


