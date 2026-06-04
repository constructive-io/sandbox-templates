-- Deploy: schemas/myapp_auth_private/schema/default_function_privs/authenticated
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_auth_private GRANT ALL ON FUNCTIONS TO authenticated;

