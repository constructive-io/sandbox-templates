-- Deploy: schemas/myapp_store_private/schema/default_function_privs/anonymous
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_private/schema


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_store_private GRANT ALL ON FUNCTIONS TO anonymous;

