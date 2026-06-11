-- Revert: schemas/myapp_memberships_public/schema/default_table_privs/administrator


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_memberships_public REVOKE ALL ON TABLES FROM administrator;


