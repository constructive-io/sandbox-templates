-- Revert: schemas/myapp_logging_public/schema/default_function_privs/authenticated


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_logging_public REVOKE ALL ON FUNCTIONS FROM authenticated;


