-- Revert: schemas/myapp_permissions_public/tables/org_permission_defaults/columns/id/alterations/alt0000000494


ALTER TABLE myapp_permissions_public.org_permission_defaults 
  ALTER COLUMN id DROP DEFAULT;


