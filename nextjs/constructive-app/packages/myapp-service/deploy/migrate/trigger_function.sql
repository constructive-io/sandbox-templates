-- Deploy: migrate/trigger_function
-- made with <3 @ constructive.io

-- requires: migrate/trigger


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

INSERT INTO metaschema_public.trigger_function (
  id,
  database_id,
  name,
  code,
  created_at,
  updated_at
) VALUES
  ('019eaaf4-aa45-7835-81d6-339720ad547c', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', 'users_search_tsv_tsv', NULL, '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-c490-75e5-89ee-bb739bab5d1b', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', 'org_membership_settings_seed_fn', NULL, '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-cf5e-7bbe-af6e-0ccf58853680', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', 'org_profile_templates_seed_fn', NULL, '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-ed50-7a50-abe6-f688a1f3b24f', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', 'app_namespaces_rename_proxy', NULL, '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-ed64-75ac-ae83-a75e0beb281f', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', 'app_namespaces_job_namespaceprovision_insert', NULL, '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-f0c1-7ba5-836b-a1b9946c7aa1', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', 'user_secrets_hash', NULL, '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-f2be-7441-a35d-1ec31491349d', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', 'app_secrets_hash', NULL, '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z');


SET session_replication_role TO DEFAULT;


