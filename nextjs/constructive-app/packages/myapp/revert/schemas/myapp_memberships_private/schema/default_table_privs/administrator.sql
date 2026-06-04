-- Revert: schemas/myapp_memberships_private/schema/default_table_privs/administrator


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_memberships_private REVOKE ALL ON TABLES FROM administrator;


