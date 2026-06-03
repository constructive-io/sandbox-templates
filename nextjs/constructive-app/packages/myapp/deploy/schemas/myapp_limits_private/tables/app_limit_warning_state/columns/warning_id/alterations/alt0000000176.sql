-- Deploy: schemas/myapp_limits_private/tables/app_limit_warning_state/columns/warning_id/alterations/alt0000000176
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_private/schema
-- requires: schemas/myapp_limits_private/tables/app_limit_warning_state/columns/warning_id/column


COMMENT ON COLUMN myapp_limits_private.app_limit_warning_state.warning_id IS E'Reference to the limit_warnings config row that triggered this warning';

