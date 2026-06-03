-- Revert: schemas/myapp_user_identifiers_public/schema/default_seq_privs/authenticated


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_user_identifiers_public REVOKE USAGE ON SEQUENCES FROM authenticated;


