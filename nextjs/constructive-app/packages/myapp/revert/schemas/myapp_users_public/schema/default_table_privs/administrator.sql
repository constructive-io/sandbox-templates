-- Revert: schemas/myapp_users_public/schema/default_table_privs/administrator


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_users_public REVOKE ALL ON TABLES FROM administrator;


