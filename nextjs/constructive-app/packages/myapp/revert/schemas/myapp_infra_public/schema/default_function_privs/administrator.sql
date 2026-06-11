-- Revert: schemas/myapp_infra_public/schema/default_function_privs/administrator


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_infra_public REVOKE ALL ON FUNCTIONS FROM administrator;


