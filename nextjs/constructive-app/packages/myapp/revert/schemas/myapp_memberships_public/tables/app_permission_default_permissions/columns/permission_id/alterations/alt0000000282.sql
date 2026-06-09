-- Revert: schemas/myapp_memberships_public/tables/app_permission_default_permissions/columns/permission_id/alterations/alt0000000282


ALTER TABLE myapp_memberships_public.app_permission_default_permissions 
  ALTER COLUMN permission_id DROP NOT NULL;


