-- Revert: schemas/myapp_memberships_public/tables/app_memberships/columns/updated_by/column


ALTER TABLE myapp_memberships_public.app_memberships 
  DROP COLUMN updated_by RESTRICT;


