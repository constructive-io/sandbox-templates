-- Deploy: schemas/myapp_memberships_public/schema/default_table_privs/administrator
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_memberships_public GRANT ALL ON TABLES TO administrator;

