-- Revert: schemas/myapp_store_private/tables/user_state/columns/name/column


ALTER TABLE myapp_store_private.user_state 
  DROP COLUMN name RESTRICT;


