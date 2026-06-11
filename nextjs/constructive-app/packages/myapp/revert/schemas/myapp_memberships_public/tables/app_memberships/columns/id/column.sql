-- Revert: schemas/myapp_memberships_public/tables/app_memberships/columns/id/column


ALTER TABLE myapp_memberships_public.app_memberships 
  DROP COLUMN id RESTRICT;


