-- Revert: schemas/myapp_store_public/schema/default_function_privs/authenticated


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_store_public REVOKE ALL ON FUNCTIONS FROM authenticated;


