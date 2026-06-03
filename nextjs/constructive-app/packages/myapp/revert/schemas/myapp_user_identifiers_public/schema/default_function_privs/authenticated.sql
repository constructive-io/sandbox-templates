-- Revert: schemas/myapp_user_identifiers_public/schema/default_function_privs/authenticated


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_user_identifiers_public REVOKE ALL ON FUNCTIONS FROM authenticated;


