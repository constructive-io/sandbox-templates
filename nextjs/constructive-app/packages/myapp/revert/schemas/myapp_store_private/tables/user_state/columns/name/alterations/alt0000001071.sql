-- Revert: schemas/myapp_store_private/tables/user_state/columns/name/alterations/alt0000001071


ALTER TABLE myapp_store_private.user_state 
  ALTER COLUMN name DROP NOT NULL;


