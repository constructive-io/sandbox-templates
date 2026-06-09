-- Revert: schemas/myapp_store_private/tables/app_secrets/columns/namespace_id/alterations/alt0000001424


ALTER TABLE myapp_store_private.app_secrets 
  ALTER COLUMN namespace_id DROP NOT NULL;


