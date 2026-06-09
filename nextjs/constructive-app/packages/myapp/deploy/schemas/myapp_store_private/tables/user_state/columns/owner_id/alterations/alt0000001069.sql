-- Deploy: schemas/myapp_store_private/tables/user_state/columns/owner_id/alterations/alt0000001069
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_store_private/tables/user_state/table
-- requires: schemas/myapp_store_private/tables/user_state/columns/owner_id/column


ALTER TABLE myapp_store_private.user_state 
  ALTER COLUMN owner_id SET NOT NULL;

