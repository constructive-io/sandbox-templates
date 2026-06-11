-- Revert: schemas/myapp_memberships_private/schema/default_seq_privs/administrator


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_memberships_private REVOKE USAGE ON SEQUENCES FROM administrator;


