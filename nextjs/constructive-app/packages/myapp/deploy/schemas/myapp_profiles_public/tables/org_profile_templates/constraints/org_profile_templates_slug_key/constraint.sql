-- Deploy: schemas/myapp_profiles_public/tables/org_profile_templates/constraints/org_profile_templates_slug_key/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/org_profile_templates/table


ALTER TABLE myapp_profiles_public.org_profile_templates 
  ADD CONSTRAINT org_profile_templates_slug_key 
    UNIQUE (slug);

