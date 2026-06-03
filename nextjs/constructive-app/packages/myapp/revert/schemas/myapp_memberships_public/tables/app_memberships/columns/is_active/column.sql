-- Revert: schemas/myapp_memberships_public/tables/app_memberships/columns/is_active/column


ALTER TABLE myapp_memberships_public.app_memberships 
  DROP COLUMN is_active RESTRICT;


