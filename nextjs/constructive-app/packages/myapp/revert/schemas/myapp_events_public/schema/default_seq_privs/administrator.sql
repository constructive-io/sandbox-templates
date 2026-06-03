-- Revert: schemas/myapp_events_public/schema/default_seq_privs/administrator


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_events_public REVOKE USAGE ON SEQUENCES FROM administrator;


