-- Revert: schemas/myapp_limits_public/schema/default_seq_privs/administrator


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_limits_public REVOKE USAGE ON SEQUENCES FROM administrator;


