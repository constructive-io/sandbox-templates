-- Revert: schemas/myapp_store_private/schema/default_seq_privs/authenticated


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_store_private REVOKE USAGE ON SEQUENCES FROM authenticated;


