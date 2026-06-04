-- Revert: schemas/myapp_auth_private/tables/session_credentials/columns/access_level/column


ALTER TABLE myapp_auth_private.session_credentials 
  DROP COLUMN access_level RESTRICT;


