-- Revert: schemas/myapp_users_public/schema/default_function_privs/administrator


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_users_public REVOKE ALL ON FUNCTIONS FROM administrator;


