-- Deploy: schemas/myapp_profiles_private/schema/default_function_privs/authenticated
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_private/schema


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_profiles_private GRANT ALL ON FUNCTIONS TO authenticated;

