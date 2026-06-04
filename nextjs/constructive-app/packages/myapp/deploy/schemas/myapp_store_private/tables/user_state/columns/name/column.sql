-- Deploy: schemas/myapp_store_private/tables/user_state/columns/name/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_store_private/tables/user_state/table


ALTER TABLE myapp_store_private.user_state 
  ADD COLUMN name text;

