-- Revert: schemas/myapp_infra_public/schema/default_seq_privs/authenticated


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_infra_public REVOKE USAGE ON SEQUENCES FROM authenticated;


