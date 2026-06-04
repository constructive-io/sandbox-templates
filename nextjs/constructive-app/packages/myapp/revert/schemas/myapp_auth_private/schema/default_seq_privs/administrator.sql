-- Revert: schemas/myapp_auth_private/schema/default_seq_privs/administrator


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_auth_private REVOKE USAGE ON SEQUENCES FROM administrator;


