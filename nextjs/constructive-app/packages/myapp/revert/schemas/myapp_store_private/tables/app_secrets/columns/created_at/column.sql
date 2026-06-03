-- Revert: schemas/myapp_store_private/tables/app_secrets/columns/created_at/column


ALTER TABLE myapp_store_private.app_secrets 
  DROP COLUMN created_at RESTRICT;


