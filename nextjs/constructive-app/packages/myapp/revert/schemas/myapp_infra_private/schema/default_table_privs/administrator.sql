-- Revert: schemas/myapp_infra_private/schema/default_table_privs/administrator


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_infra_private REVOKE ALL ON TABLES FROM administrator;


