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
  ('019e8c61-974c-72ea-b019-fcb3d3f7b468', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4a0a-7a8a-8039-70e3486a12a3', 'rls_module', '{"role_schema":"myapp_auth_public","authenticate":"authenticate","current_role":"current_user","current_role_id":"current_user_id","current_ip_address":"current_ip_address","current_user_agent":"current_user_agent","authenticate_schema":"myapp_auth_private","authenticate_strict":"authenticate_strict"}'),
  ('019e8c61-974c-7433-8107-70f04a5a275a', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4a0a-7f8f-9e53-65ec95334efc', 'rls_module', '{"role_schema":"myapp_auth_public","authenticate":"authenticate","current_role":"current_user","current_role_id":"current_user_id","current_ip_address":"current_ip_address","current_user_agent":"current_user_agent","authenticate_schema":"myapp_auth_private","authenticate_strict":"authenticate_strict"}'),
  ('019e8c61-974c-7462-b272-bbff53a19520', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4a0b-7145-913d-8f389afb2907', 'rls_module', '{"role_schema":"myapp_auth_public","authenticate":"authenticate","current_role":"current_user","current_role_id":"current_user_id","current_ip_address":"current_ip_address","current_user_agent":"current_user_agent","authenticate_schema":"myapp_auth_private","authenticate_strict":"authenticate_strict"}'),
  ('019e8c61-974c-7488-b7ad-f78d78ba3210', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4a0b-7336-a41d-3e1cf3163822', 'rls_module', '{"role_schema":"myapp_auth_public","authenticate":"authenticate","current_role":"current_user","current_role_id":"current_user_id","current_ip_address":"current_ip_address","current_user_agent":"current_user_agent","authenticate_schema":"myapp_auth_private","authenticate_strict":"authenticate_strict"}'),
  ('019e8c61-974c-74ac-ad60-487f3ac8671e', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-8fc6-79e7-a531-fd299567b9b3', 'rls_module', '{"role_schema":"myapp_auth_public","authenticate":"authenticate","current_role":"current_user","current_role_id":"current_user_id","current_ip_address":"current_ip_address","current_user_agent":"current_user_agent","authenticate_schema":"myapp_auth_private","authenticate_strict":"authenticate_strict"}');


SET session_replication_role TO DEFAULT;


