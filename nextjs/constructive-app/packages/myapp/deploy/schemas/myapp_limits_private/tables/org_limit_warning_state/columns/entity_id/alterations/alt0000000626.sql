-- Deploy: schemas/myapp_limits_private/tables/org_limit_warning_state/columns/entity_id/alterations/alt0000000626
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_private/schema
-- requires: schemas/myapp_limits_private/tables/org_limit_warning_state/columns/entity_id/column


COMMENT ON COLUMN myapp_limits_private.org_limit_warning_state.entity_id IS E'Entity context for org-scoped warnings';

