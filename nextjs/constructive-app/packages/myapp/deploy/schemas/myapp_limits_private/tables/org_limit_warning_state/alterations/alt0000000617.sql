-- Deploy: schemas/myapp_limits_private/tables/org_limit_warning_state/alterations/alt0000000617
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_private/schema
-- requires: schemas/myapp_limits_private/tables/org_limit_warning_state/table


COMMENT ON TABLE myapp_limits_private.org_limit_warning_state IS E'Tracks which warnings have been sent to avoid duplicate notifications. One row per warning config per actor.';

