-- Deploy: schemas/myapp_limits_private/tables/app_limit_warning_state/constraints/app_limit_warning_states_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_private/schema
-- requires: schemas/myapp_limits_private/tables/app_limit_warning_state/table


ALTER TABLE myapp_limits_private.app_limit_warning_state 
  ADD CONSTRAINT app_limit_warning_states_pkey PRIMARY KEY (id);

