-- Revert: schemas/myapp_auth_private/tables/sessions/columns/last_password_verified/column


ALTER TABLE myapp_auth_private.sessions 
  DROP COLUMN last_password_verified RESTRICT;


