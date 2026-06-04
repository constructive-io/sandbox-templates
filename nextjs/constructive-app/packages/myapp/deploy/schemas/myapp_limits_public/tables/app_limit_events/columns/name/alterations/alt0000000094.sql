-- Deploy: schemas/myapp_limits_public/tables/app_limit_events/columns/name/alterations/alt0000000094
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_events/columns/name/column


COMMENT ON COLUMN myapp_limits_public.app_limit_events.name IS 'Limit name this event applies to';

