-- Deploy: schemas/myapp_limits_private/tables/app_limit_warning_state/columns/warned_at/alterations/alt0000000180
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_private/schema
-- requires: schemas/myapp_limits_private/tables/app_limit_warning_state/columns/warned_at/column


COMMENT ON COLUMN myapp_limits_private.app_limit_warning_state.warned_at IS 'Timestamp when the warning was sent';

