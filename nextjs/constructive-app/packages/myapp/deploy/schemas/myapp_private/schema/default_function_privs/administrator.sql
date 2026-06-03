-- Deploy: schemas/myapp_private/schema/default_function_privs/administrator
-- made with <3 @ constructive.io

-- requires: schemas/myapp_private/schema


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_private GRANT ALL ON FUNCTIONS TO administrator;

