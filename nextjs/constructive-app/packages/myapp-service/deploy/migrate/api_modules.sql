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
  ('019eaaf4-f63e-72da-8248-9dfe28bd390e', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-a9f3-72f5-8de7-eaadb9498833', 'rls_module', '{"role_schema":"myapp_auth_public","authenticate":"authenticate","current_role":"current_user","current_role_id":"current_user_id","current_ip_address":"current_ip_address","current_user_agent":"current_user_agent","authenticate_schema":"myapp_auth_private","authenticate_strict":"authenticate_strict"}'),
  ('019eaaf4-f63e-7437-8b44-1ca19d835c37', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-a9f3-78ca-9f79-1961e3031af5', 'rls_module', '{"role_schema":"myapp_auth_public","authenticate":"authenticate","current_role":"current_user","current_role_id":"current_user_id","current_ip_address":"current_ip_address","current_user_agent":"current_user_agent","authenticate_schema":"myapp_auth_private","authenticate_strict":"authenticate_strict"}'),
  ('019eaaf4-f63e-746e-9a8a-d8a1be6eacee', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-a9f3-7aa0-97d3-bffbcccfe74c', 'rls_module', '{"role_schema":"myapp_auth_public","authenticate":"authenticate","current_role":"current_user","current_role_id":"current_user_id","current_ip_address":"current_ip_address","current_user_agent":"current_user_agent","authenticate_schema":"myapp_auth_private","authenticate_strict":"authenticate_strict"}'),
  ('019eaaf4-f63e-7492-a27e-bfb8820ca800', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-a9f3-7c43-96db-e79b1cc717a2', 'rls_module', '{"role_schema":"myapp_auth_public","authenticate":"authenticate","current_role":"current_user","current_role_id":"current_user_id","current_ip_address":"current_ip_address","current_user_agent":"current_user_agent","authenticate_schema":"myapp_auth_private","authenticate_strict":"authenticate_strict"}'),
  ('019eaaf4-f63e-74c3-b8fe-950c997170f0', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-ef69-7366-a138-7d41c1fa503b', 'rls_module', '{"role_schema":"myapp_auth_public","authenticate":"authenticate","current_role":"current_user","current_role_id":"current_user_id","current_ip_address":"current_ip_address","current_user_agent":"current_user_agent","authenticate_schema":"myapp_auth_private","authenticate_strict":"authenticate_strict"}');


SET session_replication_role TO DEFAULT;


