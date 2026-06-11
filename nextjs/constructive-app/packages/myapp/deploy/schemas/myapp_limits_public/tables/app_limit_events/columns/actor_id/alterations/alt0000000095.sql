-- Deploy: schemas/myapp_limits_public/tables/app_limit_events/columns/actor_id/alterations/alt0000000095
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_events/columns/actor_id/column


COMMENT ON COLUMN myapp_limits_public.app_limit_events.actor_id IS E'User who triggered this event; NULL for system/aggregate events';

