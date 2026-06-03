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
  ('019e8c61-49a0-7ac1-950a-16310a95c129', '019e8c61-4997-70bf-8a77-bbd439338daf', 'public', 'myapp_public', NULL, true),
  ('019e8c61-49a1-75b6-9cbb-ac1d04f63115', '019e8c61-4997-70bf-8a77-bbd439338daf', 'private', 'myapp_private', NULL, false),
  ('019e8c61-49e1-75a4-9a57-e3f79a96bdc6', '019e8c61-4997-70bf-8a77-bbd439338daf', 'app_public', 'myapp_app_public', NULL, true),
  ('019e8c61-49f7-71a4-bd66-0c7899f0f8b8', '019e8c61-4997-70bf-8a77-bbd439338daf', 'app_private', 'myapp_app_private', NULL, false),
  ('019e8c61-4a0e-7988-9f2d-cad4db71ff77', '019e8c61-4997-70bf-8a77-bbd439338daf', 'users_public', 'myapp_users_public', NULL, true),
  ('019e8c61-4aa5-7ee8-b6fe-28b0e2768392', '019e8c61-4997-70bf-8a77-bbd439338daf', 'memberships_public', 'myapp_memberships_public', NULL, true),
  ('019e8c61-4afe-77fc-a88c-8b17ed435e82', '019e8c61-4997-70bf-8a77-bbd439338daf', 'permissions_public', 'myapp_permissions_public', NULL, true),
  ('019e8c61-4b16-7849-b914-d3923fa00fe8', '019e8c61-4997-70bf-8a77-bbd439338daf', 'permissions_private', 'myapp_permissions_private', NULL, false),
  ('019e8c61-4ba6-703e-be8a-8e32073223f1', '019e8c61-4997-70bf-8a77-bbd439338daf', 'limits_public', 'myapp_limits_public', NULL, true),
  ('019e8c61-4bbc-797f-9e0d-ae185ea9a75e', '019e8c61-4997-70bf-8a77-bbd439338daf', 'limits_private', 'myapp_limits_private', NULL, false),
  ('019e8c61-4f34-73ee-a5e2-d2e07ad61720', '019e8c61-4997-70bf-8a77-bbd439338daf', 'memberships_private', 'myapp_memberships_private', NULL, false),
  ('019e8c61-526b-7c17-a063-9c0b9fb68faa', '019e8c61-4997-70bf-8a77-bbd439338daf', 'events_public', 'myapp_events_public', NULL, true),
  ('019e8c61-528c-7456-b4f5-cba30c7894d9', '019e8c61-4997-70bf-8a77-bbd439338daf', 'events_private', 'myapp_events_private', NULL, false),
  ('019e8c61-569c-7808-a894-885958141911', '019e8c61-4997-70bf-8a77-bbd439338daf', 'profiles_public', 'myapp_profiles_public', NULL, true),
  ('019e8c61-56c3-7ea1-ba86-833a00e287c4', '019e8c61-4997-70bf-8a77-bbd439338daf', 'profiles_private', 'myapp_profiles_private', NULL, false),
  ('019e8c61-7e88-7171-bc93-3dc8a46f2dbb', '019e8c61-4997-70bf-8a77-bbd439338daf', 'store_private', 'myapp_store_private', NULL, true),
  ('019e8c61-7f7e-7366-93d8-7cb135ff10b4', '019e8c61-4997-70bf-8a77-bbd439338daf', 'auth_private', 'myapp_auth_private', NULL, false),
  ('019e8c61-8c19-7c16-9da8-8302fab9a2a2', '019e8c61-4997-70bf-8a77-bbd439338daf', 'infra_public', 'myapp_infra_public', NULL, true),
  ('019e8c61-8c62-7afa-af2d-b32b0c82d082', '019e8c61-4997-70bf-8a77-bbd439338daf', 'infra_private', 'myapp_infra_private', NULL, false),
  ('019e8c61-9189-70ce-95d5-a7fd7d779a93', '019e8c61-4997-70bf-8a77-bbd439338daf', 'store_public', 'myapp_store_public', NULL, true),
  ('019e8c61-96a5-773e-bb49-a2c70e4713ff', '019e8c61-4997-70bf-8a77-bbd439338daf', 'auth_public', 'myapp_auth_public', NULL, true),
  ('019e8c61-9753-75b8-a09f-c571535167ab', '019e8c61-4997-70bf-8a77-bbd439338daf', 'user_identifiers_public', 'myapp_user_identifiers_public', NULL, true),
  ('019e8c61-97a2-70e7-9173-a157b4a7e66b', '019e8c61-4997-70bf-8a77-bbd439338daf', 'user_identifiers_private', 'myapp_user_identifiers_private', NULL, false),
  ('019e8c61-9987-77c3-a908-9d091c0819ea', '019e8c61-4997-70bf-8a77-bbd439338daf', 'invites_public', 'myapp_invites_public', NULL, true),
  ('019e8c61-99de-7790-907d-e76ed31e6fae', '019e8c61-4997-70bf-8a77-bbd439338daf', 'invites_private', 'myapp_invites_private', NULL, false),
  ('019e8c61-a1b3-7312-9fb5-48dd943188ae', '019e8c61-4997-70bf-8a77-bbd439338daf', 'logging_public', 'myapp_logging_public', NULL, true);


SET session_replication_role TO DEFAULT;


