-- Revert: schemas/myapp_app_private/schema/default_function_privs/authenticated


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_app_private REVOKE ALL ON FUNCTIONS FROM authenticated;


