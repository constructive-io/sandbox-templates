-- Deploy: schemas/myapp_infra_public/tables/app_namespace_events/columns/actor_id/alterations/alt0000001390
-- made with <3 @ constructive.io

-- requires: schemas/myapp_infra_public/schema
-- requires: schemas/myapp_infra_public/tables/app_namespace_events/columns/actor_id/column


COMMENT ON COLUMN myapp_infra_public.app_namespace_events.actor_id IS E'User who triggered this event (NULL for system/automated)';

