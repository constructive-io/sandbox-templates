-- Revert: schemas/myapp_store_private/tables/app_secrets/columns/id/alterations/alt0000001379


ALTER TABLE myapp_store_private.app_secrets 
  ALTER COLUMN id DROP DEFAULT;


