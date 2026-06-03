-- Revert: schemas/myapp_memberships_public/tables/app_admin_grants/columns/created_at/column


ALTER TABLE myapp_memberships_public.app_admin_grants 
  DROP COLUMN created_at RESTRICT;


