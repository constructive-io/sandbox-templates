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
  label,
  description,
  smart_tags,
  category,
  module,
  scope,
  tags,
  is_public,
  created_at,
  updated_at
) VALUES
  ('019eaaf4-a98c-721b-917c-d43cc6b29b01', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', 'public', 'myapp_public', 'public', NULL, NULL, 'app', NULL, NULL, '{}', true, '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-a98c-7a02-91ff-02f38f427e28', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', 'private', 'myapp_private', 'private', NULL, NULL, 'app', NULL, NULL, '{}', false, '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-a9c9-7aef-b745-7f1f5cd5e610', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', 'app_public', 'myapp_app_public', 'app_public', NULL, NULL, 'app', NULL, NULL, '{}', true, '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-a9de-7ceb-8bbb-a20c7a8e0a1b', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', 'app_private', 'myapp_app_private', 'app_private', NULL, NULL, 'app', NULL, NULL, '{}', false, '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-a9f7-72b6-9a15-44faf2e40170', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', 'users_public', 'myapp_users_public', 'users_public', NULL, NULL, 'app', NULL, NULL, '{}', true, '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-aa88-7de6-b751-72f64d8bcc50', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', 'memberships_public', 'myapp_memberships_public', 'memberships_public', NULL, NULL, 'app', NULL, NULL, '{}', true, '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-aadb-778f-902a-91e751731d94', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', 'permissions_public', 'myapp_permissions_public', 'permissions_public', NULL, NULL, 'app', NULL, NULL, '{}', true, '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-aaf2-7540-a35a-612afc331b3d', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', 'permissions_private', 'myapp_permissions_private', 'permissions_private', NULL, NULL, 'app', NULL, NULL, '{}', false, '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-ab77-7082-874b-03ac48ee0667', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', 'limits_public', 'myapp_limits_public', 'limits_public', NULL, NULL, 'app', NULL, NULL, '{}', true, '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-ab8c-7326-b74d-76d82fad9f61', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', 'limits_private', 'myapp_limits_private', 'limits_private', NULL, NULL, 'app', NULL, NULL, '{}', false, '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-aed4-7b99-9fbe-be3017bb6b7f', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', 'memberships_private', 'myapp_memberships_private', 'memberships_private', NULL, NULL, 'app', NULL, NULL, '{}', false, '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-b287-7afd-bef4-173fcebab403', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', 'events_public', 'myapp_events_public', 'events_public', NULL, NULL, 'app', NULL, NULL, '{}', true, '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-b2a7-7448-96b2-d23026c539d1', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', 'events_private', 'myapp_events_private', 'events_private', NULL, NULL, 'app', NULL, NULL, '{}', false, '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-b672-7241-b447-aa32328ae3e1', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', 'profiles_public', 'myapp_profiles_public', 'profiles_public', NULL, NULL, 'app', NULL, NULL, '{}', true, '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-b696-7c48-8639-7c8449be5a65', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', 'profiles_private', 'myapp_profiles_private', 'profiles_private', NULL, NULL, 'app', NULL, NULL, '{}', false, '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-de1b-77f0-a56f-21f46d611e9f', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', 'store_private', 'myapp_store_private', 'store_private', NULL, NULL, 'app', NULL, NULL, '{}', true, '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-df08-7efd-a57e-3af6fdc50818', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', 'auth_private', 'myapp_auth_private', 'auth_private', NULL, NULL, 'app', NULL, NULL, '{}', false, '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-eb8e-76f9-994c-96fd9e43fb84', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', 'infra_public', 'myapp_infra_public', 'infra_public', NULL, NULL, 'app', NULL, NULL, '{}', true, '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-ebd4-7653-bea1-2859dd7be736', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', 'infra_private', 'myapp_infra_private', 'infra_private', NULL, NULL, 'app', NULL, NULL, '{}', false, '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-f0fa-7146-b7fa-00233a299e55', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', 'store_public', 'myapp_store_public', 'store_public', NULL, NULL, 'app', NULL, NULL, '{}', true, '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-f58d-7257-917f-1fe82bc504f5', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', 'auth_public', 'myapp_auth_public', 'auth_public', NULL, NULL, 'app', NULL, NULL, '{}', true, '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-f645-7ca5-a122-8475448d4a63', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', 'user_identifiers_public', 'myapp_user_identifiers_public', 'user_identifiers_public', NULL, NULL, 'app', NULL, NULL, '{}', true, '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-f694-7fd5-9c99-332d33c3885e', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', 'user_identifiers_private', 'myapp_user_identifiers_private', 'user_identifiers_private', NULL, NULL, 'app', NULL, NULL, '{}', false, '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-f863-7c03-baaf-8a3fbe7dfd39', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', 'invites_public', 'myapp_invites_public', 'invites_public', NULL, NULL, 'app', NULL, NULL, '{}', true, '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-f8bf-7484-a6fb-6d2a4d124761', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', 'invites_private', 'myapp_invites_private', 'invites_private', NULL, NULL, 'app', NULL, NULL, '{}', false, '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf5-00b9-7eb6-8e0b-a5b5e4e9a99c', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', 'logging_public', 'myapp_logging_public', 'logging_public', NULL, NULL, 'app', NULL, NULL, '{}', true, '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z');


SET session_replication_role TO DEFAULT;


