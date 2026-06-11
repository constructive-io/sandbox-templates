-- Deploy: schemas/myapp_events_public/tables/org_level_grants/alterations/alt0000000985
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_level_grants/table


COMMENT ON TABLE myapp_events_public.org_level_grants IS E'Records when a user achieves a level; prevents duplicate reward grants';

