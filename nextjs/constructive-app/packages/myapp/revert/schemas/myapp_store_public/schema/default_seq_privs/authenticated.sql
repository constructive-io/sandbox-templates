-- Revert: schemas/myapp_store_public/schema/default_seq_privs/authenticated


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_store_public REVOKE USAGE ON SEQUENCES FROM authenticated;


