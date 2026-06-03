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
  ('019e8c61-4a60-7cc9-82fd-62f33428bc4f', '019e8c61-4997-70bf-8a77-bbd439338daf', 'users_search_tsv_tsv', NULL),
  ('019e8c61-658c-7040-b68e-64c0e6fe7d38', '019e8c61-4997-70bf-8a77-bbd439338daf', 'org_membership_settings_seed_fn', NULL),
  ('019e8c61-6f74-73d3-9edf-aeb27655977b', '019e8c61-4997-70bf-8a77-bbd439338daf', 'org_profile_templates_seed_fn', NULL),
  ('019e8c61-8db5-7311-ae50-0fbc3f9418b0', '019e8c61-4997-70bf-8a77-bbd439338daf', 'app_namespaces_rename_proxy', NULL),
  ('019e8c61-8dcb-724c-9105-0003cc3fd318', '019e8c61-4997-70bf-8a77-bbd439338daf', 'app_namespaces_job_namespaceprovision_insert', NULL),
  ('019e8c61-9149-70ea-b0df-016100c1eb9a', '019e8c61-4997-70bf-8a77-bbd439338daf', 'user_secrets_hash', NULL),
  ('019e8c61-9382-7f84-9fae-4b04f1007903', '019e8c61-4997-70bf-8a77-bbd439338daf', 'app_secrets_hash', NULL);


SET session_replication_role TO DEFAULT;


