-- Revert: schemas/myapp_memberships_public/tables/app_grants/columns/permissions/column


ALTER TABLE myapp_memberships_public.app_grants 
  DROP COLUMN permissions RESTRICT;


