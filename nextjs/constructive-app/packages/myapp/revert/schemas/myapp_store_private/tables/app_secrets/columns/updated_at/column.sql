-- Revert: schemas/myapp_store_private/tables/app_secrets/columns/updated_at/column


ALTER TABLE myapp_store_private.app_secrets 
  DROP COLUMN updated_at RESTRICT;


