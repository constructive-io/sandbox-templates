-- Revert: schemas/myapp_store_private/tables/app_secrets/columns/name/alterations/alt0000001386


ALTER TABLE myapp_store_private.app_secrets 
  ALTER COLUMN name DROP NOT NULL;


