-- Revert: schemas/myapp_profiles_public/tables/org_profiles/columns/updated_at/alterations/alt0000000843


ALTER TABLE myapp_profiles_public.org_profiles 
  ALTER COLUMN updated_at DROP DEFAULT;


