-- Revert: schemas/myapp_memberships_public/tables/app_permission_default_grants/columns/permission_id/alterations/alt0000000290


ALTER TABLE myapp_memberships_public.app_permission_default_grants 
  ALTER COLUMN permission_id DROP NOT NULL;


