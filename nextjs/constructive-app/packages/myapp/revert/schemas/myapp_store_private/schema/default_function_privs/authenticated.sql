-- Revert: schemas/myapp_store_private/schema/default_function_privs/authenticated


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_store_private REVOKE ALL ON FUNCTIONS FROM authenticated;


