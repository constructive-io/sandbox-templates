-- Revert: schemas/myapp_profiles_public/tables/org_profiles/columns/updated_at/column


ALTER TABLE myapp_profiles_public.org_profiles 
  DROP COLUMN updated_at RESTRICT;


