-- Deploy: schemas/myapp_events_public/tables/org_event_aggregates/constraints/org_event_aggregates_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_event_aggregates/table


ALTER TABLE myapp_events_public.org_event_aggregates 
  ADD CONSTRAINT org_event_aggregates_pkey PRIMARY KEY (id);

