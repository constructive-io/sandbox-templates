-- Deploy: schemas/myapp_profiles_public/tables/app_profiles/indexes/app_profiles_created_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/app_profiles/table
-- requires: schemas/myapp_profiles_public/tables/app_profiles/columns/created_at/column


CREATE INDEX app_profiles_created_at_idx ON myapp_profiles_public.app_profiles ( created_at );

