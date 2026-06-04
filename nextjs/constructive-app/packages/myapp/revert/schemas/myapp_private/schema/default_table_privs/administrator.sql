-- Revert: schemas/myapp_private/schema/default_table_privs/administrator


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_private REVOKE ALL ON TABLES FROM administrator;


