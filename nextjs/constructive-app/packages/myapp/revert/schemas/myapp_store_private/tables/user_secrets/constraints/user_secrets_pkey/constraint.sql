-- Revert: schemas/myapp_store_private/tables/user_secrets/constraints/user_secrets_pkey/constraint


ALTER TABLE myapp_store_private.user_secrets 
  DROP CONSTRAINT user_secrets_pkey;


