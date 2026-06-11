-- Deploy: schemas/myapp_profiles_public/tables/org_profile_definition_grants/indexes/org_profile_definition_grants_profile_id_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/org_profile_definition_grants/table
-- requires: schemas/myapp_profiles_public/tables/org_profile_definition_grants/columns/profile_id/column


CREATE INDEX org_profile_definition_grants_profile_id_idx ON myapp_profiles_public.org_profile_definition_grants USING BTREE ( profile_id );

