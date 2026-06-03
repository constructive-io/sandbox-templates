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
  ('019e8c61-4a60-7f4c-9799-26cd861f2189', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4a23-7673-9b91-1910c9553eea', 'users_search_tsv_tsv_insert_tg', NULL, NULL),
  ('019e8c61-4a61-7118-8556-85b172307847', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4a23-7673-9b91-1910c9553eea', 'users_search_tsv_tsv_update_tg', NULL, NULL),
  ('019e8c61-658c-7bcf-93cb-652a46162b89', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4a23-7673-9b91-1910c9553eea', '_00050_users_org_membership_settings_seed_trg', NULL, NULL),
  ('019e8c61-6f74-7f5c-a7d6-a777be418052', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4a23-7673-9b91-1910c9553eea', '_00060_users_org_profile_templates_seed_trg', NULL, NULL),
  ('019e8c61-8db6-756d-9e4f-e150d4d2f37e', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-8cb0-74c5-9efd-666ced7f5792', 'app_namespaces_rename_proxy_insert_tg', NULL, NULL),
  ('019e8c61-8db6-765f-9e17-f8eb3fbc9fdb', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-8cb0-74c5-9efd-666ced7f5792', 'app_namespaces_rename_proxy_update_tg', NULL, NULL),
  ('019e8c61-8dcc-7387-92cf-3bae4629682c', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-8cb0-74c5-9efd-666ced7f5792', 'app_namespaces_job_namespaceprovision_insert_tg', NULL, NULL),
  ('019e8c61-914a-74cf-b354-38ec61157a6d', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-905b-754a-9ac3-7235f1eca9fc', 'user_secrets_update_tg', NULL, NULL),
  ('019e8c61-914a-7531-aedc-4335d804f7a2', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-905b-754a-9ac3-7235f1eca9fc', 'user_secrets_insert_tg', NULL, NULL),
  ('019e8c61-9384-749b-88fc-697a73be314a', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-91df-7216-a942-eecfef8d79d7', 'app_secrets_update_tg', NULL, NULL),
  ('019e8c61-9384-758c-8b31-a403906a3834', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-91df-7216-a942-eecfef8d79d7', 'app_secrets_insert_tg', NULL, NULL);


SET session_replication_role TO DEFAULT;


