-- Deploy: schemas/myapp_permissions_public/schema/default_table_privs/administrator
-- made with <3 @ constructive.io

-- requires: schemas/myapp_permissions_public/schema


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_permissions_public GRANT ALL ON TABLES TO administrator;

