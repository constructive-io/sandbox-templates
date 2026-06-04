-- Revert: schemas/myapp_store_private/tables/user_state/columns/owner_id/column


ALTER TABLE myapp_store_private.user_state 
  DROP COLUMN owner_id RESTRICT;


