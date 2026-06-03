-- Revert: schemas/myapp_permissions_private/schema/default_function_privs/administrator


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_permissions_private REVOKE ALL ON FUNCTIONS FROM administrator;


