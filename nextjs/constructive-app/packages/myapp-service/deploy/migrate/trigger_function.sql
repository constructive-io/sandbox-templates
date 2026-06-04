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
  code
) VALUES
  ('019e917c-c7ac-7624-9c7c-8e30f4a2551f', '019e917c-c6ea-7cbc-8453-5f56622546a6', 'users_search_tsv_tsv', NULL),
  ('019e917c-e0b5-7883-b457-a10fcead6d8d', '019e917c-c6ea-7cbc-8453-5f56622546a6', 'org_membership_settings_seed_fn', NULL),
  ('019e917c-e9cb-7c3e-aa88-16c15cc75915', '019e917c-c6ea-7cbc-8453-5f56622546a6', 'org_profile_templates_seed_fn', NULL),
  ('019e917d-0667-74b0-996d-d29c521d5301', '019e917c-c6ea-7cbc-8453-5f56622546a6', 'app_namespaces_rename_proxy', NULL),
  ('019e917d-067b-72e5-813e-ac6a9c52067b', '019e917c-c6ea-7cbc-8453-5f56622546a6', 'app_namespaces_job_namespaceprovision_insert', NULL),
  ('019e917d-09cc-7ad4-b665-16bc62ccf54a', '019e917c-c6ea-7cbc-8453-5f56622546a6', 'user_secrets_hash', NULL),
  ('019e917d-0bcb-7933-8e42-bd4955b25427', '019e917c-c6ea-7cbc-8453-5f56622546a6', 'app_secrets_hash', NULL);


SET session_replication_role TO DEFAULT;


