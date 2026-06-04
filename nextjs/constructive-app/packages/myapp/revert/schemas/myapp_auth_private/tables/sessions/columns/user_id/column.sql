-- Revert: schemas/myapp_auth_private/tables/sessions/columns/user_id/column


ALTER TABLE myapp_auth_private.sessions 
  DROP COLUMN user_id RESTRICT;


