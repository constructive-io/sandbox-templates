-- Revert: schemas/myapp_profiles_public/tables/app_profiles/columns/description/column


ALTER TABLE myapp_profiles_public.app_profiles 
  DROP COLUMN description RESTRICT;


