-- Deploy: schemas/myapp_profiles_public/tables/org_profile_templates/indexes/org_profile_templates_created_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/org_profile_templates/table
-- requires: schemas/myapp_profiles_public/tables/org_profile_templates/columns/created_at/column


CREATE INDEX org_profile_templates_created_at_idx ON myapp_profiles_public.org_profile_templates ( created_at );

