-- Deploy: schemas/myapp_limits_private/tables/org_limit_warning_state/columns/id/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_private/schema
-- requires: schemas/myapp_limits_private/tables/org_limit_warning_state/table


ALTER TABLE myapp_limits_private.org_limit_warning_state 
  ADD COLUMN id uuid;

