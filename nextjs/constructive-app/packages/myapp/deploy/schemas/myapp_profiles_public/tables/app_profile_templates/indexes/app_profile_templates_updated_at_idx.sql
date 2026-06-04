-- Deploy: schemas/myapp_profiles_public/tables/app_profile_templates/indexes/app_profile_templates_updated_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/app_profile_templates/table
-- requires: schemas/myapp_profiles_public/tables/app_profile_templates/columns/updated_at/column


CREATE INDEX app_profile_templates_updated_at_idx ON myapp_profiles_public.app_profile_templates ( updated_at );

