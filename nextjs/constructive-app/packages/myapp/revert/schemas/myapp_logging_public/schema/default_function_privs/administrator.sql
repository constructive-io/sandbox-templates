-- Revert: schemas/myapp_logging_public/schema/default_function_privs/administrator


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_logging_public REVOKE ALL ON FUNCTIONS FROM administrator;


