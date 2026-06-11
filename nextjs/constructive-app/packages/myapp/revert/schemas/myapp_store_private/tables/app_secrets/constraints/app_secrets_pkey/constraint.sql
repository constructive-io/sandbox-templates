-- Revert: schemas/myapp_store_private/tables/app_secrets/constraints/app_secrets_pkey/constraint


ALTER TABLE myapp_store_private.app_secrets 
  DROP CONSTRAINT app_secrets_pkey;


