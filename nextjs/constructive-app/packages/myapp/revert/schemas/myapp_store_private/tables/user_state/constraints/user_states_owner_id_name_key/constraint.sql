-- Revert: schemas/myapp_store_private/tables/user_state/constraints/user_states_owner_id_name_key/constraint


ALTER TABLE myapp_store_private.user_state 
  DROP CONSTRAINT user_states_owner_id_name_key;


