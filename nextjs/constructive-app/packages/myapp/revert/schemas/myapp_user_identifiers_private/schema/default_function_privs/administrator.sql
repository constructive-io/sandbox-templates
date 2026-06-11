-- Revert: schemas/myapp_user_identifiers_private/schema/default_function_privs/administrator


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_user_identifiers_private REVOKE ALL ON FUNCTIONS FROM administrator;


