-- Revert: schemas/myapp_store_private/schema/default_table_privs/administrator


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_store_private REVOKE ALL ON TABLES FROM administrator;


