-- Revert: schemas/myapp_limits_private/tables/app_limit_warning_state/constraints/app_limit_warning_states_actor_id_fkey/constraint


ALTER TABLE myapp_limits_private.app_limit_warning_state 
  DROP CONSTRAINT app_limit_warning_states_actor_id_fkey;


