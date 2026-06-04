-- Deploy: schemas/myapp_store_private/tables/user_state/columns/id/alterations/alt0000001031
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_store_private/tables/user_state/table
-- requires: schemas/myapp_store_private/tables/user_state/columns/id/column


ALTER TABLE myapp_store_private.user_state 
  ALTER COLUMN id SET NOT NULL;

