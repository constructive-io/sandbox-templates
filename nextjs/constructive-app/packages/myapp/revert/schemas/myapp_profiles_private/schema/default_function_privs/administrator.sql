-- Revert: schemas/myapp_profiles_private/schema/default_function_privs/administrator


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_profiles_private REVOKE ALL ON FUNCTIONS FROM administrator;


