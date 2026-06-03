-- Deploy: schemas/myapp_limits_public/tables/app_limit_events/columns/entity_id/alterations/alt0000000096
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_events/columns/entity_id/column


COMMENT ON COLUMN myapp_limits_public.app_limit_events.entity_id IS E'Entity this event applies to; NULL for app-level events';

