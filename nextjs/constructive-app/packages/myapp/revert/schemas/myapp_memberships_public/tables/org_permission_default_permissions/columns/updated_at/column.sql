-- Revert: schemas/myapp_memberships_public/tables/org_permission_default_permissions/columns/updated_at/column


ALTER TABLE myapp_memberships_public.org_permission_default_permissions 
  DROP COLUMN updated_at RESTRICT;


