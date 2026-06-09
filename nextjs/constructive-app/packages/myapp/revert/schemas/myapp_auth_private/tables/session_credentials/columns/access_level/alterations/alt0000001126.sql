-- Revert: schemas/myapp_auth_private/tables/session_credentials/columns/access_level/alterations/alt0000001126


ALTER TABLE myapp_auth_private.session_credentials 
  ALTER COLUMN access_level DROP DEFAULT;


