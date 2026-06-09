-- Deploy: schemas/myapp_events_public/tables/app_event_types/columns/aggregation/alterations/alt0000000334
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_event_types/table
-- requires: schemas/myapp_events_public/tables/app_event_types/columns/aggregation/column


ALTER TABLE myapp_events_public.app_event_types 
  ALTER COLUMN aggregation SET DEFAULT 'count';

