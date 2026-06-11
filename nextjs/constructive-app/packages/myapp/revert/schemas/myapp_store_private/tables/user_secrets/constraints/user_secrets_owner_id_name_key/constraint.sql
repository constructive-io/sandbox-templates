-- Revert: schemas/myapp_store_private/tables/user_secrets/constraints/user_secrets_owner_id_name_key/constraint


ALTER TABLE myapp_store_private.user_secrets 
  DROP CONSTRAINT user_secrets_owner_id_name_key;


