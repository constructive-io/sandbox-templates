-- Revert: schemas/myapp_store_private/tables/user_secrets/columns/updated_at/column


ALTER TABLE myapp_store_private.user_secrets 
  DROP COLUMN updated_at RESTRICT;


