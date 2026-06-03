-- Deploy: schemas/myapp_profiles_public/tables/org_profiles/indexes/org_profiles_created_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/org_profiles/table
-- requires: schemas/myapp_profiles_public/tables/org_profiles/columns/created_at/column


CREATE INDEX org_profiles_created_at_idx ON myapp_profiles_public.org_profiles ( created_at );

