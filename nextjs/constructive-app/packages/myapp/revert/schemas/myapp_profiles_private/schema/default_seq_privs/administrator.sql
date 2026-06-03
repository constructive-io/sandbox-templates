-- Revert: schemas/myapp_profiles_private/schema/default_seq_privs/administrator


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_profiles_private REVOKE USAGE ON SEQUENCES FROM administrator;


