-- Revert: schemas/myapp_store_private/tables/user_secrets/columns/id/column


ALTER TABLE myapp_store_private.user_secrets 
  DROP COLUMN id RESTRICT;


