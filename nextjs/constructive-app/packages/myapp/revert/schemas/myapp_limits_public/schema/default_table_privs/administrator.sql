-- Revert: schemas/myapp_limits_public/schema/default_table_privs/administrator


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_limits_public REVOKE ALL ON TABLES FROM administrator;


