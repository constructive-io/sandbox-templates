-- Revert: schemas/myapp_store_private/tables/app_secrets/constraints/app_secrets_namespace_id_fkey/constraint


ALTER TABLE myapp_store_private.app_secrets 
  DROP CONSTRAINT app_secrets_namespace_id_fkey;


