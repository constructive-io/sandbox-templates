-- Revert: schemas/myapp_limits_public/schema/default_function_privs/authenticated


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_limits_public REVOKE ALL ON FUNCTIONS FROM authenticated;


