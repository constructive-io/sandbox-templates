-- Deploy: schemas/myapp_user_identifiers_private/schema/default_function_privs/administrator
-- made with <3 @ constructive.io

-- requires: schemas/myapp_user_identifiers_private/schema


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_user_identifiers_private GRANT ALL ON FUNCTIONS TO administrator;

