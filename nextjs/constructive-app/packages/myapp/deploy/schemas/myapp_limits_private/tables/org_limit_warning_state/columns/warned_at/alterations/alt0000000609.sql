-- Deploy: schemas/myapp_limits_private/tables/org_limit_warning_state/columns/warned_at/alterations/alt0000000609
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_private/schema
-- requires: schemas/myapp_limits_private/tables/org_limit_warning_state/table
-- requires: schemas/myapp_limits_private/tables/org_limit_warning_state/columns/warned_at/column


ALTER TABLE myapp_limits_private.org_limit_warning_state 
  ALTER COLUMN warned_at SET NOT NULL;

