-- Revert: schemas/myapp_permissions_private/schema/default_function_privs/authenticated


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_permissions_private REVOKE ALL ON FUNCTIONS FROM authenticated;


