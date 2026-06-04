-- Deploy: migrate/api_modules
-- made with <3 @ constructive.io

-- requires: migrate/site_themes


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

INSERT INTO services_public.api_modules (
  id,
  database_id,
  api_id,
  name,
  data
) VALUES
  ('019e917d-0f2a-7a9d-bc5b-2657350b0b4a', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c75a-78a6-baa2-3719f2be3e3e', 'rls_module', '{"role_schema":"myapp_auth_public","authenticate":"authenticate","current_role":"current_user","current_role_id":"current_user_id","current_ip_address":"current_ip_address","current_user_agent":"current_user_agent","authenticate_schema":"myapp_auth_private","authenticate_strict":"authenticate_strict"}'),
  ('019e917d-0f2a-7be1-bf9d-c4583f003af8', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c75a-7e77-b403-7536b1952127', 'rls_module', '{"role_schema":"myapp_auth_public","authenticate":"authenticate","current_role":"current_user","current_role_id":"current_user_id","current_ip_address":"current_ip_address","current_user_agent":"current_user_agent","authenticate_schema":"myapp_auth_private","authenticate_strict":"authenticate_strict"}'),
  ('019e917d-0f2a-7c15-ab16-d9493bef7384', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c75b-7074-b91d-72a88f8874e6', 'rls_module', '{"role_schema":"myapp_auth_public","authenticate":"authenticate","current_role":"current_user","current_role_id":"current_user_id","current_ip_address":"current_ip_address","current_user_agent":"current_user_agent","authenticate_schema":"myapp_auth_private","authenticate_strict":"authenticate_strict"}'),
  ('019e917d-0f2a-7c38-b65a-a546207ccd7f', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c75b-7229-a913-3924ddeca7ab', 'rls_module', '{"role_schema":"myapp_auth_public","authenticate":"authenticate","current_role":"current_user","current_role_id":"current_user_id","current_ip_address":"current_ip_address","current_user_agent":"current_user_agent","authenticate_schema":"myapp_auth_private","authenticate_strict":"authenticate_strict"}'),
  ('019e917d-0f2a-7c5a-a530-3b8b9987a1ec', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-0851-79d9-90e2-a3f89839fe59', 'rls_module', '{"role_schema":"myapp_auth_public","authenticate":"authenticate","current_role":"current_user","current_role_id":"current_user_id","current_ip_address":"current_ip_address","current_user_agent":"current_user_agent","authenticate_schema":"myapp_auth_private","authenticate_strict":"authenticate_strict"}');


SET session_replication_role TO DEFAULT;


