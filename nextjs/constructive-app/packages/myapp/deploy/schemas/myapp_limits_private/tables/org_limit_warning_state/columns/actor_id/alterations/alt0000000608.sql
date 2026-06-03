-- Deploy: schemas/myapp_limits_private/tables/org_limit_warning_state/columns/actor_id/alterations/alt0000000608
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_private/schema
-- requires: schemas/myapp_limits_private/tables/org_limit_warning_state/columns/actor_id/column


COMMENT ON COLUMN myapp_limits_private.org_limit_warning_state.actor_id IS 'User who was warned';

