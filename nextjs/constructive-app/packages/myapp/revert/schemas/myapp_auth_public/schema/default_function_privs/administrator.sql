-- Revert: schemas/myapp_auth_public/schema/default_function_privs/administrator


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_auth_public REVOKE ALL ON FUNCTIONS FROM administrator;


