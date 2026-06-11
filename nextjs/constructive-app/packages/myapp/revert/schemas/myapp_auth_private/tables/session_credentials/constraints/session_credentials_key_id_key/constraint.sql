-- Revert: schemas/myapp_auth_private/tables/session_credentials/constraints/session_credentials_key_id_key/constraint


ALTER TABLE myapp_auth_private.session_credentials 
  DROP CONSTRAINT session_credentials_key_id_key;


