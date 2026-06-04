-- Deploy: schemas/myapp_limits_private/tables/org_limit_warning_state/constraints/org_limit_warning_states_warning_id_actor_id_entity_id_key/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_private/schema
-- requires: schemas/myapp_limits_private/tables/org_limit_warning_state/table


ALTER TABLE myapp_limits_private.org_limit_warning_state 
  ADD CONSTRAINT org_limit_warning_states_warning_id_actor_id_entity_id_key 
    UNIQUE (warning_id, actor_id, entity_id);

