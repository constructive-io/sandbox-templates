-- Revert: schemas/myapp_memberships_public/tables/app_memberships/columns/granted/column


ALTER TABLE myapp_memberships_public.app_memberships 
  DROP COLUMN granted RESTRICT;


