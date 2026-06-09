-- Revert: schemas/myapp_memberships_public/tables/app_permission_default_permissions/columns/id/alterations/alt0000000280


ALTER TABLE myapp_memberships_public.app_permission_default_permissions 
  ALTER COLUMN id DROP NOT NULL;


