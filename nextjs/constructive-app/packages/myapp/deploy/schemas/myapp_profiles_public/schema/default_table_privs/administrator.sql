-- Deploy: schemas/myapp_profiles_public/schema/default_table_privs/administrator
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_profiles_public GRANT ALL ON TABLES TO administrator;

