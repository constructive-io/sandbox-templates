-- Revert: schemas/myapp_memberships_public/schema/default_function_privs/authenticated


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_memberships_public REVOKE ALL ON FUNCTIONS FROM authenticated;


