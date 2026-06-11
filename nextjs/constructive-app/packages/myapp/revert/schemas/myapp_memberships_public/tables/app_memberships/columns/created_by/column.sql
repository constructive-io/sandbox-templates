-- Revert: schemas/myapp_memberships_public/tables/app_memberships/columns/created_by/column


ALTER TABLE myapp_memberships_public.app_memberships 
  DROP COLUMN created_by RESTRICT;


