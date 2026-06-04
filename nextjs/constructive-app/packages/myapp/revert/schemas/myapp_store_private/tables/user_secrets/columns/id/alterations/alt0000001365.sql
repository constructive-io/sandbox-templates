-- Revert: schemas/myapp_store_private/tables/user_secrets/columns/id/alterations/alt0000001365


ALTER TABLE myapp_store_private.user_secrets 
  ALTER COLUMN id DROP NOT NULL;


