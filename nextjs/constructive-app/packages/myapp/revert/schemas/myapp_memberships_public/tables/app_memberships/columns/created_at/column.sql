-- Revert: schemas/myapp_memberships_public/tables/app_memberships/columns/created_at/column


ALTER TABLE myapp_memberships_public.app_memberships 
  DROP COLUMN created_at RESTRICT;


