-- Deploy: schemas/myapp_events_public/tables/org_event_types/constraints/org_event_types_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_event_types/table


ALTER TABLE myapp_events_public.org_event_types 
  ADD CONSTRAINT org_event_types_pkey PRIMARY KEY (id);

