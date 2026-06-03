-- Deploy: schemas/myapp_limits_private/tables/app_limit_warning_state/columns/id/alterations/alt0000000173
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_private/schema
-- requires: schemas/myapp_limits_private/tables/app_limit_warning_state/table
-- requires: schemas/myapp_limits_private/tables/app_limit_warning_state/columns/id/column


ALTER TABLE myapp_limits_private.app_limit_warning_state 
  ALTER COLUMN id SET NOT NULL;

