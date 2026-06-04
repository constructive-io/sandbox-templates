-- Revert: schemas/myapp_auth_private/tables/session_secrets/policies/enable_row_level_security


ALTER TABLE myapp_auth_private.session_secrets 
  DISABLE ROW LEVEL SECURITY;


