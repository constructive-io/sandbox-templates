-- Revert: schemas/myapp_profiles_public/tables/org_profiles/columns/id/column


ALTER TABLE myapp_profiles_public.org_profiles 
  DROP COLUMN id RESTRICT;


