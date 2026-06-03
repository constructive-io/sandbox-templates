-- Deploy: schemas/myapp_limits_public/tables/app_limits/columns/actor_id/alterations/alt0000000054
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limits/columns/actor_id/column


COMMENT ON COLUMN myapp_limits_public.app_limits.actor_id IS 'User whose usage is being tracked against this limit';

