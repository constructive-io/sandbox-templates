-- Revert: schemas/myapp_store_private/tables/app_secrets/columns/updated_at/alterations/alt0000001398


ALTER TABLE myapp_store_private.app_secrets 
  ALTER COLUMN updated_at DROP DEFAULT;


