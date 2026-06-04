-- Revert: schemas/myapp_app_public/schema/default_table_privs/administrator


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_app_public REVOKE ALL ON TABLES FROM administrator;


