-- Deploy: schemas/myapp_store_private/tables/user_state/constraints/user_states_owner_id_name_key/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_store_private/tables/user_state/table


ALTER TABLE myapp_store_private.user_state 
  ADD CONSTRAINT user_states_owner_id_name_key 
    UNIQUE (owner_id, name);

