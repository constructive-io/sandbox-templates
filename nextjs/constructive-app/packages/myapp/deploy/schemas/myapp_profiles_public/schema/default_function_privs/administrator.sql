-- Deploy: schemas/myapp_profiles_public/schema/default_function_privs/administrator
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_profiles_public GRANT ALL ON FUNCTIONS TO administrator;

