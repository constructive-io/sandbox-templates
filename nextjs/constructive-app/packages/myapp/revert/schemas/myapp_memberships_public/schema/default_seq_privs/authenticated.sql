-- Revert: schemas/myapp_memberships_public/schema/default_seq_privs/authenticated


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_memberships_public REVOKE USAGE ON SEQUENCES FROM authenticated;


