-- Revert: schemas/myapp_store_private/tables/app_secrets/columns/created_at/alterations/alt0000001397


ALTER TABLE myapp_store_private.app_secrets 
  ALTER COLUMN created_at DROP DEFAULT;


