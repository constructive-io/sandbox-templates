-- Revert: schemas/myapp_profiles_public/tables/org_profiles/columns/slug/alterations/alt0000000794


ALTER TABLE myapp_profiles_public.org_profiles 
  ALTER COLUMN slug DROP NOT NULL;


