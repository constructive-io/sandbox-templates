-- Deploy: schemas/myapp_profiles_public/tables/app_profile_permissions/indexes/app_profile_permissions_profile_id_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/app_profile_permissions/table
-- requires: schemas/myapp_profiles_public/tables/app_profile_permissions/columns/profile_id/column


CREATE INDEX app_profile_permissions_profile_id_idx ON myapp_profiles_public.app_profile_permissions USING BTREE ( profile_id );

