-- Deploy: schemas/myapp_events_public/tables/app_levels/columns/description/alterations/alt0000000338
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_levels/columns/description/column


COMMENT ON COLUMN myapp_events_public.app_levels.description IS E'Human-readable description of what this level represents';

