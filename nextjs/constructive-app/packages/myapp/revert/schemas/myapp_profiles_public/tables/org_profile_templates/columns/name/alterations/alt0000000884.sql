-- Revert: schemas/myapp_profiles_public/tables/org_profile_templates/columns/name/alterations/alt0000000884


ALTER TABLE myapp_profiles_public.org_profile_templates 
  ALTER COLUMN name DROP NOT NULL;


