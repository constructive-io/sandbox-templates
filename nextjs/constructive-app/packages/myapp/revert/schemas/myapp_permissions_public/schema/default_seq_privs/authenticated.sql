-- Revert: schemas/myapp_permissions_public/schema/default_seq_privs/authenticated


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_permissions_public REVOKE USAGE ON SEQUENCES FROM authenticated;


