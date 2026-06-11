-- Revert: schemas/myapp_permissions_private/schema/default_seq_privs/administrator


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_permissions_private REVOKE USAGE ON SEQUENCES FROM administrator;


