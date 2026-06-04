-- Revert: schemas/myapp_events_private/schema/default_table_privs/administrator


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_events_private REVOKE ALL ON TABLES FROM administrator;


