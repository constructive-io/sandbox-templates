-- Revert: schemas/myapp_app_private/schema/default_seq_privs/administrator


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_app_private REVOKE USAGE ON SEQUENCES FROM administrator;


