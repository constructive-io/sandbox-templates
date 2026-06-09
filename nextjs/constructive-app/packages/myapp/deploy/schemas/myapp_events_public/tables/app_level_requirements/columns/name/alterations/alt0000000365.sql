-- Deploy: schemas/myapp_events_public/tables/app_level_requirements/columns/name/alterations/alt0000000365
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_level_requirements/columns/name/column


COMMENT ON COLUMN myapp_events_public.app_level_requirements.name IS E'Name identifier of the requirement (matches step names)';

