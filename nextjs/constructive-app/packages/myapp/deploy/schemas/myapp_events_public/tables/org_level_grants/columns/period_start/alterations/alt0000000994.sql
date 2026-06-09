-- Deploy: schemas/myapp_events_public/tables/org_level_grants/columns/period_start/alterations/alt0000000994
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_level_grants/columns/period_start/column


COMMENT ON COLUMN myapp_events_public.org_level_grants.period_start IS E'Period start for periodic achievements; -infinity for non-periodic (earn-once)';

