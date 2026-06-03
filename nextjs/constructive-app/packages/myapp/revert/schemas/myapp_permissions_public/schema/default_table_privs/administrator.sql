-- Revert: schemas/myapp_permissions_public/schema/default_table_privs/administrator


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_permissions_public REVOKE ALL ON TABLES FROM administrator;


