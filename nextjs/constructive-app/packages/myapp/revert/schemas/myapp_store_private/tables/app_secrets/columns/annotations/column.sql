-- Revert: schemas/myapp_store_private/tables/app_secrets/columns/annotations/column


ALTER TABLE myapp_store_private.app_secrets 
  DROP COLUMN annotations RESTRICT;


