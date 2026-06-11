-- Revert: schemas/myapp_limits_private/schema/default_seq_privs/administrator


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_limits_private REVOKE USAGE ON SEQUENCES FROM administrator;


