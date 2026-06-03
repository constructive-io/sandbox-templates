-- Revert: schemas/myapp_private/schema/default_seq_privs/authenticated


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_private REVOKE USAGE ON SEQUENCES FROM authenticated;


