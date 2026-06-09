-- Revert: schemas/myapp_store_private/tables/app_secrets/columns/key_id/alterations/alt0000001421


ALTER TABLE myapp_store_private.app_secrets 
  ALTER COLUMN key_id DROP NOT NULL;


