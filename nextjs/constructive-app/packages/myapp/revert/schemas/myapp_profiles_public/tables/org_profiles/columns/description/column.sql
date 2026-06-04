-- Revert: schemas/myapp_profiles_public/tables/org_profiles/columns/description/column


ALTER TABLE myapp_profiles_public.org_profiles 
  DROP COLUMN description RESTRICT;


