-- Deploy: schemas/myapp_events_public/tables/app_event_types/columns/category/alterations/alt0000000331
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_event_types/columns/category/column


COMMENT ON COLUMN myapp_events_public.app_event_types.category IS E'Grouping category: onboarding, engagement, analytics, commerce, etc.';

