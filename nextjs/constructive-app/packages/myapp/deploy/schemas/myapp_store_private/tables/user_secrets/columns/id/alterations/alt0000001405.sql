-- Deploy: schemas/myapp_store_private/tables/user_secrets/columns/id/alterations/alt0000001405
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_store_private/tables/user_secrets/table
-- requires: schemas/myapp_store_private/tables/user_secrets/columns/id/column


ALTER TABLE myapp_store_private.user_secrets 
  ALTER COLUMN id SET NOT NULL;

