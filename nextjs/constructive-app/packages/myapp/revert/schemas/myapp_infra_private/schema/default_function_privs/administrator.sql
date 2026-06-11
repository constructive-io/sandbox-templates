-- Revert: schemas/myapp_infra_private/schema/default_function_privs/administrator


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_infra_private REVOKE ALL ON FUNCTIONS FROM administrator;


