-- Deploy: schemas/myapp_app_private/schema/default_function_privs/anonymous
-- made with <3 @ constructive.io

-- requires: schemas/myapp_app_private/schema


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_app_private GRANT ALL ON FUNCTIONS TO anonymous;

