-- Revert: schemas/myapp_events_public/tables/org_event_types/columns/aggregation/alterations/alt0000000905


ALTER TABLE myapp_events_public.org_event_types 
  ALTER COLUMN aggregation DROP DEFAULT;


