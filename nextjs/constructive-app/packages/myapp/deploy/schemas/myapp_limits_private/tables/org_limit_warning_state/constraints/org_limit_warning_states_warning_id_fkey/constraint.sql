-- Deploy: schemas/myapp_limits_private/tables/org_limit_warning_state/constraints/org_limit_warning_states_warning_id_fkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_private/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_warnings/table
-- requires: schemas/myapp_limits_private/tables/org_limit_warning_state/table


ALTER TABLE myapp_limits_private.org_limit_warning_state 
  ADD CONSTRAINT org_limit_warning_states_warning_id_fkey 
    FOREIGN KEY(warning_id) 
    REFERENCES myapp_limits_public.org_limit_warnings (id) 
    ON DELETE CASCADE;

