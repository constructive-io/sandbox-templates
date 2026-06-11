-- Revert: schemas/myapp_events_private/schema/default_function_privs/anonymous


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_events_private REVOKE ALL ON FUNCTIONS FROM anonymous;


