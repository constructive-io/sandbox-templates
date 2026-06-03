-- Revert: schemas/myapp_infra_private/schema/default_function_privs/authenticated


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_infra_private REVOKE ALL ON FUNCTIONS FROM authenticated;


