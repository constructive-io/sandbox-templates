-- Revert: schemas/myapp_store_private/tables/user_secrets/columns/created_at/alterations/alt0000001374


ALTER TABLE myapp_store_private.user_secrets 
  ALTER COLUMN created_at DROP DEFAULT;


