-- Revert: schemas/myapp_store_private/tables/user_state/policies/enable_row_level_security


ALTER TABLE myapp_store_private.user_state 
  DISABLE ROW LEVEL SECURITY;


