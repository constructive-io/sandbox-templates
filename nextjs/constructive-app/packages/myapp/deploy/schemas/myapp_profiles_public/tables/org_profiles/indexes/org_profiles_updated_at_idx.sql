-- Deploy: schemas/myapp_profiles_public/tables/org_profiles/indexes/org_profiles_updated_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/org_profiles/table
-- requires: schemas/myapp_profiles_public/tables/org_profiles/columns/updated_at/column


CREATE INDEX org_profiles_updated_at_idx ON myapp_profiles_public.org_profiles ( updated_at );

