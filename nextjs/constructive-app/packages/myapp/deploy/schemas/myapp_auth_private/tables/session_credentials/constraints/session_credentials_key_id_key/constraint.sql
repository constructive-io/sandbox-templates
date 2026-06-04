-- Deploy: schemas/myapp_auth_private/tables/session_credentials/constraints/session_credentials_key_id_key/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/session_credentials/table


ALTER TABLE myapp_auth_private.session_credentials 
  ADD CONSTRAINT session_credentials_key_id_key 
    UNIQUE (key_id);

