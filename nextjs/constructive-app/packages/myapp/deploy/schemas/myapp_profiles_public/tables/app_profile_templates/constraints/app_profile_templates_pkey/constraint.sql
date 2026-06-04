-- Deploy: schemas/myapp_profiles_public/tables/app_profile_templates/constraints/app_profile_templates_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/app_profile_templates/table


ALTER TABLE myapp_profiles_public.app_profile_templates 
  ADD CONSTRAINT app_profile_templates_pkey PRIMARY KEY (id);

