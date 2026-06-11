-- Revert: schemas/myapp_app_public/schema/default_function_privs/anonymous


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_app_public REVOKE ALL ON FUNCTIONS FROM anonymous;


