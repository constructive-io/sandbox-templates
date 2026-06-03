-- Deploy: schemas/myapp_profiles_public/tables/org_profiles/indexes/org_profiles_default_global_uniq
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/org_profiles/table
-- requires: schemas/myapp_profiles_public/tables/org_profiles/columns/entity_id/column
-- requires: schemas/myapp_profiles_public/tables/org_profiles/columns/is_default/column


CREATE UNIQUE INDEX org_profiles_default_global_uniq ON myapp_profiles_public.org_profiles ( (true::boolean) ) WHERE is_default = true AND entity_id IS NULL;

