-- Deploy: migrate/schema
-- made with <3 @ constructive.io

-- requires: migrate/database


SET session_replication_role TO replica;
-- using replica in case we are deploying triggers to metaschema_public

-- unaccent, postgis affected and require grants
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public to public;

DO $LQLMIGRATION$
  DECLARE
  BEGIN

    EXECUTE format('GRANT CONNECT ON DATABASE %I TO %I', current_database(), 'app_user');
    EXECUTE format('GRANT CONNECT ON DATABASE %I TO %I', current_database(), 'app_admin');

  END;
$LQLMIGRATION$;

INSERT INTO metaschema_public.schema (
  id,
  database_id,
  name,
  schema_name,
  description,
  is_public
) VALUES
  ('019e917c-c6f3-7cfe-8e20-2872005ed46a', '019e917c-c6ea-7cbc-8453-5f56622546a6', 'public', 'myapp_public', NULL, true),
  ('019e917c-c6f4-7509-8765-1c7add3329cd', '019e917c-c6ea-7cbc-8453-5f56622546a6', 'private', 'myapp_private', NULL, false),
  ('019e917c-c732-73af-86d7-61993602b5ef', '019e917c-c6ea-7cbc-8453-5f56622546a6', 'app_public', 'myapp_app_public', NULL, true),
  ('019e917c-c746-7b5f-8ccf-4c8add0cd703', '019e917c-c6ea-7cbc-8453-5f56622546a6', 'app_private', 'myapp_app_private', NULL, false),
  ('019e917c-c75e-769d-9faa-c68e3a60388f', '019e917c-c6ea-7cbc-8453-5f56622546a6', 'users_public', 'myapp_users_public', NULL, true),
  ('019e917c-c7f0-7236-a174-ac435182f333', '019e917c-c6ea-7cbc-8453-5f56622546a6', 'memberships_public', 'myapp_memberships_public', NULL, true),
  ('019e917c-c841-76b3-af42-e57dfd9c76b2', '019e917c-c6ea-7cbc-8453-5f56622546a6', 'permissions_public', 'myapp_permissions_public', NULL, true),
  ('019e917c-c856-7d16-a3a3-baf2b5dc5b44', '019e917c-c6ea-7cbc-8453-5f56622546a6', 'permissions_private', 'myapp_permissions_private', NULL, false),
  ('019e917c-c8d6-71ca-a98e-2f41b291294e', '019e917c-c6ea-7cbc-8453-5f56622546a6', 'limits_public', 'myapp_limits_public', NULL, true),
  ('019e917c-c8ec-7140-b0b3-c7d939ed67ba', '019e917c-c6ea-7cbc-8453-5f56622546a6', 'limits_private', 'myapp_limits_private', NULL, false),
  ('019e917c-cc47-7b68-8560-d56484bdcb7e', '019e917c-c6ea-7cbc-8453-5f56622546a6', 'memberships_private', 'myapp_memberships_private', NULL, false),
  ('019e917c-cefd-7a33-8589-4d32ef636da1', '019e917c-c6ea-7cbc-8453-5f56622546a6', 'events_public', 'myapp_events_public', NULL, true),
  ('019e917c-cf1b-7e96-8a0f-0882c4734359', '019e917c-c6ea-7cbc-8453-5f56622546a6', 'events_private', 'myapp_events_private', NULL, false),
  ('019e917c-d2c2-725f-b21f-faac9034b650', '019e917c-c6ea-7cbc-8453-5f56622546a6', 'profiles_public', 'myapp_profiles_public', NULL, true),
  ('019e917c-d2ea-723c-a0e0-9bbe73c9820d', '019e917c-c6ea-7cbc-8453-5f56622546a6', 'profiles_private', 'myapp_profiles_private', NULL, false),
  ('019e917c-f7dd-78de-a2e0-656dfd691ce2', '019e917c-c6ea-7cbc-8453-5f56622546a6', 'store_private', 'myapp_store_private', NULL, true),
  ('019e917c-f8c8-71a7-a290-a547326f1537', '019e917c-c6ea-7cbc-8453-5f56622546a6', 'auth_private', 'myapp_auth_private', NULL, false),
  ('019e917d-04c8-71ca-b083-c314ec5be4c9', '019e917c-c6ea-7cbc-8453-5f56622546a6', 'infra_public', 'myapp_infra_public', NULL, true),
  ('019e917d-050d-72e6-8561-d4b8acf5a7b4', '019e917c-c6ea-7cbc-8453-5f56622546a6', 'infra_private', 'myapp_infra_private', NULL, false),
  ('019e917d-0a0b-750d-b32c-510881b049fe', '019e917c-c6ea-7cbc-8453-5f56622546a6', 'store_public', 'myapp_store_public', NULL, true),
  ('019e917d-0e8d-7ce1-bda9-478afe2fc049', '019e917c-c6ea-7cbc-8453-5f56622546a6', 'auth_public', 'myapp_auth_public', NULL, true),
  ('019e917d-0f31-7c9d-aa51-b57afb1ca42c', '019e917c-c6ea-7cbc-8453-5f56622546a6', 'user_identifiers_public', 'myapp_user_identifiers_public', NULL, true),
  ('019e917d-0f7c-7e02-8f9f-2cc746c82430', '019e917c-c6ea-7cbc-8453-5f56622546a6', 'user_identifiers_private', 'myapp_user_identifiers_private', NULL, false),
  ('019e917d-1145-7c59-b486-511857ea43bb', '019e917c-c6ea-7cbc-8453-5f56622546a6', 'invites_public', 'myapp_invites_public', NULL, true),
  ('019e917d-1193-7977-bdad-3bf32a89b3a6', '019e917c-c6ea-7cbc-8453-5f56622546a6', 'invites_private', 'myapp_invites_private', NULL, false),
  ('019e917d-18f2-7163-8640-3153d16bbeb2', '019e917c-c6ea-7cbc-8453-5f56622546a6', 'logging_public', 'myapp_logging_public', NULL, true);


SET session_replication_role TO DEFAULT;


