-- Deploy: schemas/myapp_public/schema/default_table_privs/administrator
-- made with <3 @ constructive.io

-- requires: schemas/myapp_public/schema


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_public GRANT ALL ON TABLES TO administrator;

