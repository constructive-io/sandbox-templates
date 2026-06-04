-- Revert: schemas/myapp_permissions_public/tables/org_permission_defaults/columns/permissions/column


ALTER TABLE myapp_permissions_public.org_permission_defaults 
  DROP COLUMN permissions RESTRICT;


