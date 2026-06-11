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
  api_id,
  site_id,
  subdomain,
  domain
) VALUES
  ('019eaaf4-a9c9-73a3-aa5b-f2df1b9f2ed5', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-a9f3-72f5-8de7-eaadb9498833', NULL, 'admin-myapp', 'localhost'),
  ('019eaaf4-a9c9-7609-9ce9-7d32459efefc', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-a9f3-78ca-9f79-1961e3031af5', NULL, 'auth-myapp', 'localhost'),
  ('019eaaf4-a9c9-76d8-b41c-c1917005b082', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-a9f3-7aa0-97d3-bffbcccfe74c', NULL, 'api-myapp', 'localhost'),
  ('019eaaf4-a9c9-77a6-ad37-39bb3a28a3d5', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-a9f3-7c43-96db-e79b1cc717a2', NULL, 'usage-myapp', 'localhost'),
  ('019eaaf5-0def-7065-86ac-f3f4875804d2', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf5-0de1-7c4b-aceb-8c5797cea3d6', NULL, 'migrate-myapp', 'localhost');


SET session_replication_role TO DEFAULT;


