-- Deploy: schemas/myapp_profiles_public/tables/org_profile_templates/indexes/org_profile_templates_default_uniq
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/org_profile_templates/table
-- requires: schemas/myapp_profiles_public/tables/org_profile_templates/columns/is_default/column


CREATE UNIQUE INDEX org_profile_templates_default_uniq ON myapp_profiles_public.org_profile_templates ( (true::boolean) ) WHERE is_default = true;

