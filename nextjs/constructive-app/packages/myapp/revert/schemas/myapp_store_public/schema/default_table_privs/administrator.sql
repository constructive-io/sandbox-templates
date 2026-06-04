-- Revert: schemas/myapp_store_public/schema/default_table_privs/administrator


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_store_public REVOKE ALL ON TABLES FROM administrator;


