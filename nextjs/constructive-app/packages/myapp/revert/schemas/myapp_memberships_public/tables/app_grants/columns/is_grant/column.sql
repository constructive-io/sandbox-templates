-- Revert: schemas/myapp_memberships_public/tables/app_grants/columns/is_grant/column


ALTER TABLE myapp_memberships_public.app_grants 
  DROP COLUMN is_grant RESTRICT;


