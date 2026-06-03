-- Revert: schemas/myapp_store_private/tables/app_secrets/columns/namespace_id/column


ALTER TABLE myapp_store_private.app_secrets 
  DROP COLUMN namespace_id RESTRICT;


