-- Revert: schemas/myapp_profiles_public/schema/default_seq_privs/administrator


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_profiles_public REVOKE USAGE ON SEQUENCES FROM administrator;


