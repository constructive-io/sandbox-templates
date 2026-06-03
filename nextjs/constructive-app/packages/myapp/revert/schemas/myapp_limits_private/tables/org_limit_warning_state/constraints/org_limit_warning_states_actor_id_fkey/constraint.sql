-- Revert: schemas/myapp_limits_private/tables/org_limit_warning_state/constraints/org_limit_warning_states_actor_id_fkey/constraint


ALTER TABLE myapp_limits_private.org_limit_warning_state 
  DROP CONSTRAINT org_limit_warning_states_actor_id_fkey;


