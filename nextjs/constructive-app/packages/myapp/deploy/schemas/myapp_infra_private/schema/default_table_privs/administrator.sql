-- Deploy: schemas/myapp_infra_private/schema/default_table_privs/administrator
-- made with <3 @ constructive.io

-- requires: schemas/myapp_infra_private/schema


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_infra_private GRANT ALL ON TABLES TO administrator;

