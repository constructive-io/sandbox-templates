-- Revert: schemas/myapp_auth_private/schema/default_function_privs/anonymous


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_auth_private REVOKE ALL ON FUNCTIONS FROM anonymous;


