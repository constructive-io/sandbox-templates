-- Deploy: migrate/function
-- made with <3 @ constructive.io

-- requires: migrate/schema


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

INSERT INTO metaschema_public.function (
  id,
  database_id,
  schema_id,
  name
) VALUES
  ('019e8c61-9743-7d28-b591-1189c1928186', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-7f7e-7366-93d8-7cb135ff10b4', 'authenticate'),
  ('019e8c61-9745-7161-b00f-b66766ebfac4', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-7f7e-7366-93d8-7cb135ff10b4', 'authenticate_strict'),
  ('019e8c61-9746-7377-8427-1a5da859d25f', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-96a5-773e-bb49-a2c70e4713ff', 'current_user'),
  ('019e8c61-9747-75c1-8193-afc6735eddab', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-96a5-773e-bb49-a2c70e4713ff', 'current_user_id'),
  ('019e8c61-9748-77f2-a27e-18e822a7909e', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-96a5-773e-bb49-a2c70e4713ff', 'current_user_agent'),
  ('019e8c61-9749-79db-bbb4-96b9980d735b', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-96a5-773e-bb49-a2c70e4713ff', 'current_ip_address');


SET session_replication_role TO DEFAULT;


