-- Deploy: migrate/rls_settings
-- made with <3 @ constructive.io

-- requires: migrate/api_schemas


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

INSERT INTO services_public.rls_settings (
  id,
  database_id,
  authenticate_schema_id,
  role_schema_id,
  authenticate_function_id,
  authenticate_strict_function_id,
  current_role_function_id,
  current_role_id_function_id,
  current_user_agent_function_id,
  current_ip_address_function_id
) VALUES
  ('019e917d-0f29-7482-914e-5595ee798507', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-f8c8-71a7-a290-a547326f1537', '019e917d-0e8d-7ce1-bda9-478afe2fc049', '019e917d-0f22-758d-9756-490179cfd0ec', '019e917d-0f23-78f8-8e4a-3cf816bd1453', '019e917d-0f24-7b63-8893-cdeb82ee2591', '019e917d-0f25-7d88-a6ef-5611df1d6c11', '019e917d-0f26-7fd6-89af-1140e247e6d8', '019e917d-0f28-7229-bbbf-61f6b369ef16');


SET session_replication_role TO DEFAULT;


