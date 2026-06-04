-- Deploy: schemas/myapp_events_public/tables/app_event_types/columns/updated_at/alterations/alt0000000331
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_event_types/table
-- requires: schemas/myapp_events_public/tables/app_event_types/columns/updated_at/column


ALTER TABLE myapp_events_public.app_event_types 
  ALTER COLUMN updated_at SET DEFAULT now();

