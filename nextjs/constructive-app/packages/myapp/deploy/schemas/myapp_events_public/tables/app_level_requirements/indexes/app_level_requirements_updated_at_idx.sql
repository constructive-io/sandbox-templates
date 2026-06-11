-- Deploy: schemas/myapp_events_public/tables/app_level_requirements/indexes/app_level_requirements_updated_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_level_requirements/table
-- requires: schemas/myapp_events_public/tables/app_level_requirements/columns/updated_at/column


CREATE INDEX app_level_requirements_updated_at_idx ON myapp_events_public.app_level_requirements ( updated_at );

