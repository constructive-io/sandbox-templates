-- Deploy: migrate/domains
-- made with <3 @ constructive.io

-- requires: migrate/default_privilege


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

INSERT INTO services_public.domains (
  id,
  database_id,
  site_id,
  api_id,
  domain,
  subdomain
) VALUES
  ('019e917c-c731-7c79-9154-ca31941ec486', '019e917c-c6ea-7cbc-8453-5f56622546a6', NULL, '019e917c-c75a-78a6-baa2-3719f2be3e3e', 'localhost', 'admin-myapp'),
  ('019e917c-c731-7e9b-9614-3957f378eef3', '019e917c-c6ea-7cbc-8453-5f56622546a6', NULL, '019e917c-c75a-7e77-b403-7536b1952127', 'localhost', 'auth-myapp'),
  ('019e917c-c731-7f6f-bb37-fb1ffef63723', '019e917c-c6ea-7cbc-8453-5f56622546a6', NULL, '019e917c-c75b-7074-b91d-72a88f8874e6', 'localhost', 'api-myapp'),
  ('019e917c-c732-7038-9509-3361bfe6c41e', '019e917c-c6ea-7cbc-8453-5f56622546a6', NULL, '019e917c-c75b-7229-a913-3924ddeca7ab', 'localhost', 'usage-myapp'),
  ('019e917d-26a8-74e0-ba89-30588897637c', '019e917c-c6ea-7cbc-8453-5f56622546a6', NULL, '019e917d-269a-7d52-82e4-65e6bd503f97', 'localhost', 'migrate-myapp');


SET session_replication_role TO DEFAULT;


