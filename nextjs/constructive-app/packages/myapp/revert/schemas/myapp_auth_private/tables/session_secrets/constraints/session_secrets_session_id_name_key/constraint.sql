-- Revert: schemas/myapp_auth_private/tables/session_secrets/constraints/session_secrets_session_id_name_key/constraint


ALTER TABLE myapp_auth_private.session_secrets 
  DROP CONSTRAINT session_secrets_session_id_name_key;


