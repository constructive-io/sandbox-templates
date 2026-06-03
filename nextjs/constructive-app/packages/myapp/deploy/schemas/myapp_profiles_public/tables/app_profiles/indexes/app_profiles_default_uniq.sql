-- Deploy: schemas/myapp_profiles_public/tables/app_profiles/indexes/app_profiles_default_uniq
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/app_profiles/table
-- requires: schemas/myapp_profiles_public/tables/app_profiles/columns/is_default/column


CREATE UNIQUE INDEX app_profiles_default_uniq ON myapp_profiles_public.app_profiles ( (true::boolean) ) WHERE is_default = true;

