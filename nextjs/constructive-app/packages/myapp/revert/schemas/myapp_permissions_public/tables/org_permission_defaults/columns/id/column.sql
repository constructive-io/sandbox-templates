-- Revert: schemas/myapp_permissions_public/tables/org_permission_defaults/columns/id/column


ALTER TABLE myapp_permissions_public.org_permission_defaults 
  DROP COLUMN id RESTRICT;


