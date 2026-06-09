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
  role_name,
  anon_role,
  is_public
) VALUES
  ('019eaaf4-a9f3-72f5-8de7-eaadb9498833', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', 'admin', 'authenticated', 'anonymous', true),
  ('019eaaf4-a9f3-78ca-9f79-1961e3031af5', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', 'auth', 'authenticated', 'anonymous', true),
  ('019eaaf4-a9f3-7aa0-97d3-bffbcccfe74c', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', 'api', 'authenticated', 'anonymous', true),
  ('019eaaf4-a9f3-7c43-96db-e79b1cc717a2', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', 'usage', 'authenticated', 'anonymous', true),
  ('019eaaf4-ef69-7366-a138-7d41c1fa503b', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', 'config', 'authenticated', 'anonymous', true),
  ('019eaaf5-0de1-7c4b-aceb-8c5797cea3d6', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', 'migrate', 'administrator', 'anonymous', true);


SET session_replication_role TO DEFAULT;


