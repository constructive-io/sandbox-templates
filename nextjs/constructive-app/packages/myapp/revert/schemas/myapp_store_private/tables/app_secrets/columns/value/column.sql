-- Revert: schemas/myapp_store_private/tables/app_secrets/columns/value/column


ALTER TABLE myapp_store_private.app_secrets 
  DROP COLUMN value RESTRICT;


