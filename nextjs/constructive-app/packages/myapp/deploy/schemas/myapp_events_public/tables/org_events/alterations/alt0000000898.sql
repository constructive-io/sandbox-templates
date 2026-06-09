-- Deploy: schemas/myapp_events_public/tables/org_events/alterations/alt0000000898
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_events/table


COMMENT ON TABLE myapp_events_public.org_events IS E'Partitioned append-only log of individual user actions; every single event ever recorded';

