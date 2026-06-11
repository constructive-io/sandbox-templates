-- Deploy: schemas/myapp_store_private/tables/user_secrets/columns/created_at/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_store_private/tables/user_secrets/table


ALTER TABLE myapp_store_private.user_secrets 
  ADD COLUMN created_at timestamptz;

