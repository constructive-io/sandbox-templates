-- Revert: schemas/myapp_profiles_public/schema/default_table_privs/administrator


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_profiles_public REVOKE ALL ON TABLES FROM administrator;


