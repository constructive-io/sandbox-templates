-- Revert: schemas/myapp_auth_public/schema/default_table_privs/administrator


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_auth_public REVOKE ALL ON TABLES FROM administrator;


