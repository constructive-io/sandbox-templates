-- Deploy: migrate/database
-- made with <3 @ constructive.io




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

INSERT INTO metaschema_public.database (
  id,
  owner_id,
  schema_hash,
  name,
  label,
  hash,
  created_at,
  updated_at
) VALUES
  ('019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-a6d3-7e8a-8645-54589f0be8f4', 'myapp', 'myapp', 'myapp', 'abfbcb18-7c4c-58c4-9b29-7da37660a2b5', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z');


SET session_replication_role TO DEFAULT;


