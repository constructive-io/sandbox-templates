-- Revert: schemas/myapp_auth_private/schema/default_table_privs/administrator


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_auth_private REVOKE ALL ON TABLES FROM administrator;


