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
  ('019e8c61-4a0a-7a8a-8039-70e3486a12a3', '019e8c61-4997-70bf-8a77-bbd439338daf', 'admin', true, 'authenticated', 'anonymous'),
  ('019e8c61-4a0a-7f8f-9e53-65ec95334efc', '019e8c61-4997-70bf-8a77-bbd439338daf', 'auth', true, 'authenticated', 'anonymous'),
  ('019e8c61-4a0b-7145-913d-8f389afb2907', '019e8c61-4997-70bf-8a77-bbd439338daf', 'api', true, 'authenticated', 'anonymous'),
  ('019e8c61-4a0b-7336-a41d-3e1cf3163822', '019e8c61-4997-70bf-8a77-bbd439338daf', 'usage', true, 'authenticated', 'anonymous'),
  ('019e8c61-8fc6-79e7-a531-fd299567b9b3', '019e8c61-4997-70bf-8a77-bbd439338daf', 'config', true, 'authenticated', 'anonymous'),
  ('019e8c61-aebf-73c9-8ccb-c5891f6ba9b6', '019e8c61-4997-70bf-8a77-bbd439338daf', 'migrate', true, 'administrator', 'anonymous');


SET session_replication_role TO DEFAULT;


