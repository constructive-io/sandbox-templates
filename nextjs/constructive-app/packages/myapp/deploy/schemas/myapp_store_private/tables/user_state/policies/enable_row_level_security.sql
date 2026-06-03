-- Deploy: schemas/myapp_store_private/tables/user_state/policies/enable_row_level_security
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_store_private/tables/user_state/table


ALTER TABLE myapp_store_private.user_state 
  ENABLE ROW LEVEL SECURITY;

