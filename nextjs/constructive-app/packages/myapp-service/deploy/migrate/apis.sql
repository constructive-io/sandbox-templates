-- Deploy: migrate/apis
-- made with <3 @ constructive.io

-- requires: migrate/sites


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

INSERT INTO services_public.apis (
  id,
  database_id,
  name,
  is_public,
  role_name,
  anon_role
) VALUES
  ('019e917c-c75a-78a6-baa2-3719f2be3e3e', '019e917c-c6ea-7cbc-8453-5f56622546a6', 'admin', true, 'authenticated', 'anonymous'),
  ('019e917c-c75a-7e77-b403-7536b1952127', '019e917c-c6ea-7cbc-8453-5f56622546a6', 'auth', true, 'authenticated', 'anonymous'),
  ('019e917c-c75b-7074-b91d-72a88f8874e6', '019e917c-c6ea-7cbc-8453-5f56622546a6', 'api', true, 'authenticated', 'anonymous'),
  ('019e917c-c75b-7229-a913-3924ddeca7ab', '019e917c-c6ea-7cbc-8453-5f56622546a6', 'usage', true, 'authenticated', 'anonymous'),
  ('019e917d-0851-79d9-90e2-a3f89839fe59', '019e917c-c6ea-7cbc-8453-5f56622546a6', 'config', true, 'authenticated', 'anonymous'),
  ('019e917d-269a-7d52-82e4-65e6bd503f97', '019e917c-c6ea-7cbc-8453-5f56622546a6', 'migrate', true, 'administrator', 'anonymous');


SET session_replication_role TO DEFAULT;


