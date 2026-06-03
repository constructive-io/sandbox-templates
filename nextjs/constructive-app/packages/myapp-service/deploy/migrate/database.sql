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
  name,
  hash
) VALUES
  ('019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-46e5-7f6e-9613-74b5d475d6a3', 'myapp', '72f94ecd-223a-585a-bbc9-d2599f5f5909');


SET session_replication_role TO DEFAULT;


