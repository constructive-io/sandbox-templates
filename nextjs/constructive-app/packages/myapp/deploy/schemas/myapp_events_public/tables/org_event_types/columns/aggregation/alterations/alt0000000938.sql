-- Deploy: schemas/myapp_events_public/tables/org_event_types/columns/aggregation/alterations/alt0000000938
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_event_types/table
-- requires: schemas/myapp_events_public/tables/org_event_types/columns/aggregation/column


ALTER TABLE myapp_events_public.org_event_types 
  ALTER COLUMN aggregation SET DEFAULT 'count';

