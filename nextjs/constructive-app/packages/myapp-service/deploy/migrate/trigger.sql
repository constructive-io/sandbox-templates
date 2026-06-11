-- Deploy: migrate/trigger
-- made with <3 @ constructive.io

-- requires: migrate/index


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

INSERT INTO metaschema_public.trigger (
  id,
  database_id,
  table_id,
  name,
  event,
  function_name,
  smart_tags,
  category,
  module,
  scope,
  tags,
  created_at,
  updated_at
) VALUES
  ('019eaaf4-aa45-7ae3-86ff-e147d0aefdaf', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-aa0c-7194-9321-949d0e7e42bc', 'users_search_tsv_tsv_insert_tg', NULL, NULL, NULL, 'app', NULL, NULL, '{}', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-aa45-7ca2-b192-68b0e81cd4df', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-aa0c-7194-9321-949d0e7e42bc', 'users_search_tsv_tsv_update_tg', NULL, NULL, NULL, 'app', NULL, NULL, '{}', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-c491-702a-b0ff-0697064e0cda', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-aa0c-7194-9321-949d0e7e42bc', '_00050_users_org_membership_settings_seed_trg', NULL, NULL, NULL, 'app', NULL, NULL, '{}', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-cf5f-7804-9b3f-e93b9caa6b4c', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-aa0c-7194-9321-949d0e7e42bc', '_00060_users_org_profile_templates_seed_trg', NULL, NULL, NULL, 'app', NULL, NULL, '{}', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-ed51-7d62-ae84-263448f52698', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-ec22-7fe1-a687-7562ccc37509', 'app_namespaces_rename_proxy_insert_tg', NULL, NULL, NULL, 'app', NULL, NULL, '{}', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-ed51-7e4c-bfda-9d203ff82373', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-ec22-7fe1-a687-7562ccc37509', 'app_namespaces_rename_proxy_update_tg', NULL, NULL, NULL, 'app', NULL, NULL, '{}', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-ed65-7724-8870-2071df73d4a3', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-ec22-7fe1-a687-7562ccc37509', 'app_namespaces_job_namespaceprovision_insert_tg', NULL, NULL, NULL, 'app', NULL, NULL, '{}', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-f0c2-7f4b-bdea-8894304fb4cf', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-efd8-7480-ad4f-3700f53bf298', 'user_secrets_update_tg', NULL, NULL, NULL, 'app', NULL, NULL, '{}', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-f0c2-7faa-88c9-cde4022da159', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-efd8-7480-ad4f-3700f53bf298', 'user_secrets_insert_tg', NULL, NULL, NULL, 'app', NULL, NULL, '{}', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-f2bf-7870-b5ad-78a321b264b2', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-f148-71f2-a8e0-46c5f36c5a8f', 'app_secrets_update_tg', NULL, NULL, NULL, 'app', NULL, NULL, '{}', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-f2bf-793d-bd06-a438e8c3f53c', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-f148-71f2-a8e0-46c5f36c5a8f', 'app_secrets_insert_tg', NULL, NULL, NULL, 'app', NULL, NULL, '{}', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z');


SET session_replication_role TO DEFAULT;


