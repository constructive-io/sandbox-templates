-- Revert: schemas/myapp_user_identifiers_public/schema/default_table_privs/administrator


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_user_identifiers_public REVOKE ALL ON TABLES FROM administrator;


