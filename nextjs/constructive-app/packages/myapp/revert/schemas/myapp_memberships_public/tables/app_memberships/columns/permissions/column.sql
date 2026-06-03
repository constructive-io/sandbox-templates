-- Revert: schemas/myapp_memberships_public/tables/app_memberships/columns/permissions/column


ALTER TABLE myapp_memberships_public.app_memberships 
  DROP COLUMN permissions RESTRICT;


