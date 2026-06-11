-- Revert: schemas/myapp_memberships_public/schema/default_function_privs/administrator


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_memberships_public REVOKE ALL ON FUNCTIONS FROM administrator;


