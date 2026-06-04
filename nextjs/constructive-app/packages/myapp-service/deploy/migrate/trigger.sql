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
  function_name
) VALUES
  ('019e917c-c7ac-791f-b186-6f584ee1e769', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c772-7ad9-bec4-337ce1956129', 'users_search_tsv_tsv_insert_tg', NULL, NULL),
  ('019e917c-c7ac-7b63-9bc4-3f561f666564', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c772-7ad9-bec4-337ce1956129', 'users_search_tsv_tsv_update_tg', NULL, NULL),
  ('019e917c-e0b6-7274-aeed-6581c1f0c2e7', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c772-7ad9-bec4-337ce1956129', '_00050_users_org_membership_settings_seed_trg', NULL, NULL),
  ('019e917c-e9cc-77d7-975a-295c3efc17e4', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c772-7ad9-bec4-337ce1956129', '_00060_users_org_profile_templates_seed_trg', NULL, NULL),
  ('019e917d-0668-7681-8cd6-15dfef1147a1', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-0558-71ab-b908-9360125ec648', 'app_namespaces_rename_proxy_insert_tg', NULL, NULL),
  ('019e917d-0668-778b-8e2c-a86ed699d6ae', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-0558-71ab-b908-9360125ec648', 'app_namespaces_rename_proxy_update_tg', NULL, NULL),
  ('019e917d-067c-73be-8821-14f3b2e8c940', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-0558-71ab-b908-9360125ec648', 'app_namespaces_job_namespaceprovision_insert_tg', NULL, NULL),
  ('019e917d-09cd-7da1-b382-79634c3cb06b', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-08e8-7b39-a720-f7005f011c33', 'user_secrets_update_tg', NULL, NULL),
  ('019e917d-09cd-7dfb-ad53-88825e9bf257', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-08e8-7b39-a720-f7005f011c33', 'user_secrets_insert_tg', NULL, NULL),
  ('019e917d-0bcc-7de9-8553-f43066dd64e7', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-0a53-794b-876d-af7f636589ff', 'app_secrets_update_tg', NULL, NULL),
  ('019e917d-0bcd-73fe-8a47-a54834b3305a', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-0a53-794b-876d-af7f636589ff', 'app_secrets_insert_tg', NULL, NULL);


SET session_replication_role TO DEFAULT;


