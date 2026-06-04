-- Revert: schemas/myapp_infra_public/schema/default_function_privs/anonymous


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_infra_public REVOKE ALL ON FUNCTIONS FROM anonymous;


