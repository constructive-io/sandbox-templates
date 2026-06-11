-- Revert: schemas/myapp_invites_private/schema/default_table_privs/administrator


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_invites_private REVOKE ALL ON TABLES FROM administrator;


