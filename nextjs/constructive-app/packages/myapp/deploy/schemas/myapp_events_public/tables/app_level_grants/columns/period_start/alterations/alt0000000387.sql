-- Deploy: schemas/myapp_events_public/tables/app_level_grants/columns/period_start/alterations/alt0000000387
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_level_grants/columns/period_start/column


COMMENT ON COLUMN myapp_events_public.app_level_grants.period_start IS E'Period start for periodic achievements; -infinity for non-periodic (earn-once)';

