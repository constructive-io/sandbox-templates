-- Revert: schemas/myapp_store_private/tables/user_secrets/columns/updated_at/alterations/alt0000001375


ALTER TABLE myapp_store_private.user_secrets 
  ALTER COLUMN updated_at DROP DEFAULT;


