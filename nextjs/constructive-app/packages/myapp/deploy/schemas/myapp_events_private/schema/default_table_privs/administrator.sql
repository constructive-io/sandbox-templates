-- Deploy: schemas/myapp_events_private/schema/default_table_privs/administrator
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_private/schema


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_events_private GRANT ALL ON TABLES TO administrator;

