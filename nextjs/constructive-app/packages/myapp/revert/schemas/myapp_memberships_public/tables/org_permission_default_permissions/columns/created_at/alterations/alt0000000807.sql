-- Revert: schemas/myapp_memberships_public/tables/org_permission_default_permissions/columns/created_at/alterations/alt0000000807


ALTER TABLE myapp_memberships_public.org_permission_default_permissions 
  ALTER COLUMN created_at DROP DEFAULT;


