-- Deploy: schemas/myapp_events_public/tables/app_event_types/constraints/app_event_types_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_event_types/table


ALTER TABLE myapp_events_public.app_event_types 
  ADD CONSTRAINT app_event_types_pkey PRIMARY KEY (id);

