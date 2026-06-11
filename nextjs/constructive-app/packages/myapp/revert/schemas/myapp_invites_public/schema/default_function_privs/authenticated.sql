-- Revert: schemas/myapp_invites_public/schema/default_function_privs/authenticated


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_invites_public REVOKE ALL ON FUNCTIONS FROM authenticated;


