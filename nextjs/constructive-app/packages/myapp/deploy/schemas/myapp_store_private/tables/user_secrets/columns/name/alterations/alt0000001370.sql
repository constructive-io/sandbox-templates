-- Deploy: schemas/myapp_store_private/tables/user_secrets/columns/name/alterations/alt0000001370
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_store_private/tables/user_secrets/table
-- requires: schemas/myapp_store_private/tables/user_secrets/columns/name/column


ALTER TABLE myapp_store_private.user_secrets 
  ALTER COLUMN name SET NOT NULL;

