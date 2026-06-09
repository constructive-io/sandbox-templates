-- Deploy: schemas/myapp_events_public/tables/org_level_requirements/columns/priority/alterations/alt0000000980
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_level_requirements/columns/priority/column


COMMENT ON COLUMN myapp_events_public.org_level_requirements.priority IS E'Display ordering priority; lower values appear first';

