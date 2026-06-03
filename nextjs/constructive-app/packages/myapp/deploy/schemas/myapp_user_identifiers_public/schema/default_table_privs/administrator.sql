-- Deploy: schemas/myapp_user_identifiers_public/schema/default_table_privs/administrator
-- made with <3 @ constructive.io

-- requires: schemas/myapp_user_identifiers_public/schema


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_user_identifiers_public GRANT ALL ON TABLES TO administrator;

