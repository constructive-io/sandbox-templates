-- Deploy: schemas/myapp_events_public/tables/app_events/constraints/app_events_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_events/table


ALTER TABLE myapp_events_public.app_events 
  ADD CONSTRAINT app_events_pkey PRIMARY KEY (created_at, id);

