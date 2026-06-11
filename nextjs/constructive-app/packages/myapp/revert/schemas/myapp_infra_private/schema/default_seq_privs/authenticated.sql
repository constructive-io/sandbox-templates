-- Revert: schemas/myapp_infra_private/schema/default_seq_privs/authenticated


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_infra_private REVOKE USAGE ON SEQUENCES FROM authenticated;


