-- Revert: schemas/myapp_memberships_public/tables/app_grants/columns/updated_at/column


ALTER TABLE myapp_memberships_public.app_grants 
  DROP COLUMN updated_at RESTRICT;


