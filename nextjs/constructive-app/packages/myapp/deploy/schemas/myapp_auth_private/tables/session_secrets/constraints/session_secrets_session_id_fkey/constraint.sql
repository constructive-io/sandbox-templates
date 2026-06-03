-- Deploy: schemas/myapp_auth_private/tables/session_secrets/constraints/session_secrets_session_id_fkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/sessions/table
-- requires: schemas/myapp_auth_private/tables/session_secrets/table


ALTER TABLE myapp_auth_private.session_secrets 
  ADD CONSTRAINT session_secrets_session_id_fkey 
    FOREIGN KEY(session_id) 
    REFERENCES myapp_auth_private.sessions (id) 
    ON DELETE CASCADE;

