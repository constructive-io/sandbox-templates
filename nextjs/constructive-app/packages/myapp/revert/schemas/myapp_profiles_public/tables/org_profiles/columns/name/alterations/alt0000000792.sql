-- Revert: schemas/myapp_profiles_public/tables/org_profiles/columns/name/alterations/alt0000000792


ALTER TABLE myapp_profiles_public.org_profiles 
  ALTER COLUMN name DROP NOT NULL;


