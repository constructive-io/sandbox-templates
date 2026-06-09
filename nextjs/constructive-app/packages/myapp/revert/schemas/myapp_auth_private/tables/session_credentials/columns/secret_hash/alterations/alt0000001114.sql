-- Revert: schemas/myapp_auth_private/tables/session_credentials/columns/secret_hash/alterations/alt0000001114


ALTER TABLE myapp_auth_private.session_credentials 
  ALTER COLUMN secret_hash DROP NOT NULL;


