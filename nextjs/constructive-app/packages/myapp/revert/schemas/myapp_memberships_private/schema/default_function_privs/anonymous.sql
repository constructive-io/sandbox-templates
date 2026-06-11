-- Revert: schemas/myapp_memberships_private/schema/default_function_privs/anonymous


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_memberships_private REVOKE ALL ON FUNCTIONS FROM anonymous;


