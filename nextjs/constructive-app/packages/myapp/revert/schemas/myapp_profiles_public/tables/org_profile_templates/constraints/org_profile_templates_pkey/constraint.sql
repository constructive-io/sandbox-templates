-- Revert: schemas/myapp_profiles_public/tables/org_profile_templates/constraints/org_profile_templates_pkey/constraint


ALTER TABLE myapp_profiles_public.org_profile_templates 
  DROP CONSTRAINT org_profile_templates_pkey;


