-- Revert: schemas/myapp_store_private/tables/user_state/columns/owner_id/alterations/alt0000001069


ALTER TABLE myapp_store_private.user_state 
  ALTER COLUMN owner_id DROP NOT NULL;


