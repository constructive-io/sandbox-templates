-- Deploy: schemas/myapp_limits_private/tables/org_limit_warning_state/constraints/org_limit_warning_states_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_private/schema
-- requires: schemas/myapp_limits_private/tables/org_limit_warning_state/table


ALTER TABLE myapp_limits_private.org_limit_warning_state 
  ADD CONSTRAINT org_limit_warning_states_pkey PRIMARY KEY (id);

