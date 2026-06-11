-- Revert: schemas/myapp_invites_public/schema/default_seq_privs/authenticated


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_invites_public REVOKE USAGE ON SEQUENCES FROM authenticated;


