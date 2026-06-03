-- Deploy: schemas/myapp_profiles_public/tables/org_profile_permissions/indexes/org_profile_permissions_permission_id_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/org_profile_permissions/table
-- requires: schemas/myapp_profiles_public/tables/org_profile_permissions/columns/permission_id/column


CREATE INDEX org_profile_permissions_permission_id_idx ON myapp_profiles_public.org_profile_permissions USING BTREE ( permission_id );

