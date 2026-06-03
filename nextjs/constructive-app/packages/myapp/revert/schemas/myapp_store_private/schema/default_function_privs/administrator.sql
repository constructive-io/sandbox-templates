-- Revert: schemas/myapp_store_private/schema/default_function_privs/administrator


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_store_private REVOKE ALL ON FUNCTIONS FROM administrator;


