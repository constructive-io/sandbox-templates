-- Deploy: schemas/myapp_events_public/tables/app_events/table
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema


CREATE TABLE myapp_events_public.app_events (
  created_at timestamptz NOT NULL DEFAULT now()
) PARTITION BY RANGE (created_at);

