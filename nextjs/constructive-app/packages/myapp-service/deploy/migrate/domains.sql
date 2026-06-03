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
  ('019e8c61-49e0-7dd7-8a50-4a3dee5762b5', '019e8c61-4997-70bf-8a77-bbd439338daf', NULL, '019e8c61-4a0a-7a8a-8039-70e3486a12a3', 'localhost', 'admin-myapp'),
  ('019e8c61-49e1-7045-9f89-ad0eb2131845', '019e8c61-4997-70bf-8a77-bbd439338daf', NULL, '019e8c61-4a0a-7f8f-9e53-65ec95334efc', 'localhost', 'auth-myapp'),
  ('019e8c61-49e1-7119-b3f3-f0f3601ab45a', '019e8c61-4997-70bf-8a77-bbd439338daf', NULL, '019e8c61-4a0b-7145-913d-8f389afb2907', 'localhost', 'api-myapp'),
  ('019e8c61-49e1-71e9-9afa-93cb81bb8e9d', '019e8c61-4997-70bf-8a77-bbd439338daf', NULL, '019e8c61-4a0b-7336-a41d-3e1cf3163822', 'localhost', 'usage-myapp'),
  ('019e8c61-aecd-7959-a216-c4b8c0d671c9', '019e8c61-4997-70bf-8a77-bbd439338daf', NULL, '019e8c61-aebf-73c9-8ccb-c5891f6ba9b6', 'localhost', 'migrate-myapp');


SET session_replication_role TO DEFAULT;


