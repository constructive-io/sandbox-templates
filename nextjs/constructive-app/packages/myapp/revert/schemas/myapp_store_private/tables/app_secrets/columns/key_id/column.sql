-- Revert: schemas/myapp_store_private/tables/app_secrets/columns/key_id/column


ALTER TABLE myapp_store_private.app_secrets 
  DROP COLUMN key_id RESTRICT;


