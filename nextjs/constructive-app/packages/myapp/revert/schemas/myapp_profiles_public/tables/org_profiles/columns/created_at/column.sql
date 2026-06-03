-- Revert: schemas/myapp_profiles_public/tables/org_profiles/columns/created_at/column


ALTER TABLE myapp_profiles_public.org_profiles 
  DROP COLUMN created_at RESTRICT;


