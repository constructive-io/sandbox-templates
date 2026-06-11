-- Deploy: schemas/myapp_limits_private/tables/app_limit_warning_state/alterations/alt0000000172
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_private/schema
-- requires: schemas/myapp_limits_private/tables/app_limit_warning_state/table


COMMENT ON TABLE myapp_limits_private.app_limit_warning_state IS E'Tracks which warnings have been sent to avoid duplicate notifications. One row per warning config per actor.';

