-- Revert: schemas/myapp_invites_private/schema/default_seq_privs/administrator


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_invites_private REVOKE USAGE ON SEQUENCES FROM administrator;


