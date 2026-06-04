-- Revert: schemas/myapp_store_private/tables/user_state/columns/id/alterations/alt0000001032


ALTER TABLE myapp_store_private.user_state 
  ALTER COLUMN id DROP DEFAULT;


