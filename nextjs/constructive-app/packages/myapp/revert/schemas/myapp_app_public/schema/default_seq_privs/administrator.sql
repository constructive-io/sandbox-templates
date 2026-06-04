-- Revert: schemas/myapp_app_public/schema/default_seq_privs/administrator


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_app_public REVOKE USAGE ON SEQUENCES FROM administrator;


