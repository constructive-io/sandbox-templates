-- Revert: schemas/myapp_invites_private/schema/default_function_privs/authenticated


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_invites_private REVOKE ALL ON FUNCTIONS FROM authenticated;


