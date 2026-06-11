-- Deploy: schemas/myapp_events_public/tables/app_level_requirements/columns/priority/alterations/alt0000000374
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_level_requirements/columns/priority/column


COMMENT ON COLUMN myapp_events_public.app_level_requirements.priority IS E'Display ordering priority; lower values appear first';

