-- Deploy: schemas/myapp_limits_private/tables/org_limit_warning_state/columns/warning_id/alterations/alt0000000605
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_private/schema
-- requires: schemas/myapp_limits_private/tables/org_limit_warning_state/table
-- requires: schemas/myapp_limits_private/tables/org_limit_warning_state/columns/warning_id/column


ALTER TABLE myapp_limits_private.org_limit_warning_state 
  ALTER COLUMN warning_id SET NOT NULL;

