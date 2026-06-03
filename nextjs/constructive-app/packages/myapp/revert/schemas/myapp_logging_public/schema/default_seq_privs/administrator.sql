-- Revert: schemas/myapp_logging_public/schema/default_seq_privs/administrator


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_logging_public REVOKE USAGE ON SEQUENCES FROM administrator;


