-- Revert: schemas/myapp_events_public/schema/default_function_privs/anonymous


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_events_public REVOKE ALL ON FUNCTIONS FROM anonymous;


