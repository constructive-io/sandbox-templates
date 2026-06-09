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
  ('019eaaf4-f635-76df-a1e0-60569fe994a8', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-df08-7efd-a57e-3af6fdc50818', 'authenticate'),
  ('019eaaf4-f636-7b1a-85bb-e28fdd00c2be', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-df08-7efd-a57e-3af6fdc50818', 'authenticate_strict'),
  ('019eaaf4-f637-7e7c-849b-bc116fbfede6', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-f58d-7257-917f-1fe82bc504f5', 'current_user'),
  ('019eaaf4-f639-71b4-92d5-98f08befa4ac', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-f58d-7257-917f-1fe82bc504f5', 'current_user_id'),
  ('019eaaf4-f63a-74c6-bdf5-7c4cad9c9903', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-f58d-7257-917f-1fe82bc504f5', 'current_user_agent'),
  ('019eaaf4-f63b-777b-b0e3-f124806fadd8', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-f58d-7257-917f-1fe82bc504f5', 'current_ip_address');


SET session_replication_role TO DEFAULT;


