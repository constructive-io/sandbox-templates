-- Revert: schemas/myapp_memberships_public/tables/app_grants/columns/created_at/column


ALTER TABLE myapp_memberships_public.app_grants 
  DROP COLUMN created_at RESTRICT;


