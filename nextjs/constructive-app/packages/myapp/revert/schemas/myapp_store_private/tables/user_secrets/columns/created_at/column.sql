-- Revert: schemas/myapp_store_private/tables/user_secrets/columns/created_at/column


ALTER TABLE myapp_store_private.user_secrets 
  DROP COLUMN created_at RESTRICT;


