-- Revert: schemas/myapp_events_private/schema/default_seq_privs/authenticated


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_events_private REVOKE USAGE ON SEQUENCES FROM authenticated;


