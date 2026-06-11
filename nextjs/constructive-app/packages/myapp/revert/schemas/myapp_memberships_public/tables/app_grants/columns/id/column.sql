-- Revert: schemas/myapp_memberships_public/tables/app_grants/columns/id/column


ALTER TABLE myapp_memberships_public.app_grants 
  DROP COLUMN id RESTRICT;


