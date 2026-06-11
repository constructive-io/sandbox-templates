-- Deploy: schemas/myapp_profiles_public/tables/app_profile_definition_grants/indexes/app_profile_definition_grants_permission_id_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/app_profile_definition_grants/table
-- requires: schemas/myapp_profiles_public/tables/app_profile_definition_grants/columns/permission_id/column


CREATE INDEX app_profile_definition_grants_permission_id_idx ON myapp_profiles_public.app_profile_definition_grants USING BTREE ( permission_id );

