-- Revert: schemas/myapp_auth_public/schema/default_seq_privs/authenticated


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_auth_public REVOKE USAGE ON SEQUENCES FROM authenticated;


