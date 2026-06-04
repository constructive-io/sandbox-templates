-- Deploy: schemas/myapp_events_public/tables/org_level_requirements/columns/required_count/alterations/alt0000000944
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_level_requirements/columns/required_count/column


COMMENT ON COLUMN myapp_events_public.org_level_requirements.required_count IS 'Number of steps needed to satisfy this requirement';

