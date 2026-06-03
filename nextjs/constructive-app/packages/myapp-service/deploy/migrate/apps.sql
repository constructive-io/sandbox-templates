-- Deploy: migrate/apps
-- made with <3 @ constructive.io

-- requires: migrate/apis


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

INSERT INTO services_public.apps (
  id,
  database_id,
  site_id,
  name,
  app_image,
  app_store_link,
  app_store_id,
  app_id_prefix,
  play_store_link
) VALUES
  ('019e8c61-4a0d-736c-8f01-4092c59fc67c', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4a0c-7a6a-8827-af11175277ee', 'Myapp', '{"url":"https://constructive.io/brand/constructive.svg","mime":"image/svg+xml"}', NULL, NULL, NULL, NULL);


SET session_replication_role TO DEFAULT;


