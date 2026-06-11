-- Revert: schemas/myapp_store_private/tables/app_secrets/columns/description/column


ALTER TABLE myapp_store_private.app_secrets 
  DROP COLUMN description RESTRICT;


