-- Deploy: schemas/myapp_profiles_public/tables/app_profile_grants/indexes/app_profile_grants_membership_id_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/app_profile_grants/table
-- requires: schemas/myapp_profiles_public/tables/app_profile_grants/columns/membership_id/column


CREATE INDEX app_profile_grants_membership_id_idx ON myapp_profiles_public.app_profile_grants USING BTREE ( membership_id );

